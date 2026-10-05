import axios, { AxiosError, type AxiosInstance } from 'axios'
import { tokenStorage } from '@/auth/tokenStorage'
import type { components } from '@/types/schema'

/**
 * El cliente axios es el ÚNICO sitio que habla con la API.
 * - Añade el token Bearer en cada petición.
 * - Si el backend responde 401 (token caducado o inválido) borra la sesión
 *   y avisa a quien se registre para redirigir al login.
 */
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

export type ApiError = {
  status: number
  message: string
  details?: components['schemas']['ValidationError'][]
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as
      { detail?: string | components['schemas']['ValidationError'] } | undefined

    if (typeof data?.detail === 'string') {
      return { status, message: data.detail }
    }
    if (Array.isArray(data?.detail)) {
      return {
        status,
        message: 'Datos inválidos',
        details: data.detail,
      }
    }
    return { status, message: error.message }
  }
  return { status: 0, message: 'Error inesperado' }
}
