import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/auth/tokenStorage'
import type { Token } from '@/types/api'
import type { components } from '@/types/schema'

/**
 * El cliente axios es el ÚNICO sitio que habla con la API.
 * - Añade el token Bearer en cada petición.
 * - Si el backend responde 401 con el token de acceso caducado, renueva la sesión con
 *   `/auth/refresh`, guarda el token nuevo y repite la petición una vez (#432).
 * - Si el refresco falla (o no hay token de refresco), borra la sesión y avisa a quien
 *   se registre para redirigir al login.
 */
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

/**
 * Endpoints where a 401 is not an expired access token. Refreshing there would either loop
 * (/auth/refresh) or hide the real error: a wrong password or a spent link.
 */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
]

type RetriableConfig = InternalAxiosRequestConfig & {
  /** The /auth/refresh call itself: its 401 must not start another refresh. */
  isRefresh?: boolean
  /** A request already repeated with the renewed token: never loop on it either. */
  retried?: boolean
}

// A single in-flight refresh: many requests failing at the same time share one call.
let refreshRequest: Promise<string> | null = null

async function renewSession(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await apiClient.post<Token>('/auth/refresh', { refresh_token: refreshToken }, {
    isRefresh: true,
  } as RetriableConfig)
  tokenStorage.setToken(data.access_token)
  return data.access_token
}

function renewSessionOnce(): Promise<string> {
  if (!refreshRequest) {
    refreshRequest = renewSession().finally(() => {
      refreshRequest = null
    })
  }
  return refreshRequest
}

/** Closes the session on the client, the same way it was closed before #432. */
function endSession(): void {
  tokenStorage.clear()
  unauthorizedHandler?.()
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined

    if (error.response?.status !== 401 || !config) return Promise.reject(error)
    // The refresh call itself failed: whoever awaited it closes the session once.
    if (config.isRefresh) return Promise.reject(error)
    // A 401 that cannot be about an expired access token: the caller shows it as it is
    // (a wrong password must not log anybody out).
    if (NO_REFRESH_PATHS.some((path) => (config.url ?? '').startsWith(path))) {
      return Promise.reject(error)
    }
    // Retried with a brand-new token and still rejected: there is no session left to renew.
    if (config.retried) {
      endSession()
      return Promise.reject(error)
    }
    // Nothing to renew with: behave as before and close the session right away.
    if (!tokenStorage.getRefreshToken()) {
      endSession()
      return Promise.reject(error)
    }

    try {
      await renewSessionOnce()
    } catch {
      endSession()
      return Promise.reject(error)
    }

    // The repeat runs outside the try: if it still gets a 401, the branch above for
    // `retried` closes the session exactly once, and a plain network error is not ours.
    config.retried = true
    // The request interceptor re-reads the renewed token from the storage.
    return apiClient.request(config)
  },
)

export type ApiError = {
  status: number
  message: string
  code?: string
  details?: components['schemas']['ValidationError'][]
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as
      { detail?: string | components['schemas']['ValidationError'][]; code?: string } | undefined

    const code = data?.code

    if (typeof data?.detail === 'string') {
      return { status, message: data.detail, code }
    }
    if (Array.isArray(data?.detail)) {
      const [first] = data.detail as components['schemas']['ValidationError'][]
      return {
        status,
        // Surface the backend message (e.g. the password rule) instead of a generic one.
        message: first?.msg ?? 'Datos inválidos',
        details: data.detail,
        code,
      }
    }
    return { status, message: error.message, code: code ?? undefined }
  }
  return { status: 0, message: 'Error inesperado' }
}

/** The largest `size` the API accepts on any list. */
export const MAX_PAGE_SIZE = 100
