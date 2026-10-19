import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient, setUnauthorizedHandler, toApiError } from '@/api/client'
import { tokenStorage } from '@/auth/tokenStorage'
import type { Token, User } from '@/types/api'

const user: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const renewed: Token = {
  access_token: 'token-nuevo',
  refresh_token: 'refresh-123',
  token_type: 'bearer',
  user,
}

function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

function unauthorized(config: InternalAxiosRequestConfig): never {
  throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
    data: { detail: 'No autenticado' },
  })
}

/** Swaps the adapter for a handler that records every request URL. */
function withAdapter(handler: (config: InternalAxiosRequestConfig) => AxiosResponse | never) {
  const urls: string[] = []
  const adapter: AxiosAdapter = async (config) => {
    urls.push(config.url ?? '')
    return handler(config)
  }
  apiClient.defaults.adapter = adapter
  return urls
}

describe('apiClient', () => {
  afterEach(() => {
    tokenStorage.clear()
    setUnauthorizedHandler(null)
    apiClient.defaults.adapter = undefined
  })

  it('añade la cabecera Authorization con el token guardado', async () => {
    tokenStorage.setSession('token-123', 'refresh-123', user)

    const originalAdapter = apiClient.defaults.adapter
    const captured: { headers?: Record<string, string> } = {}
    const adapter: AxiosAdapter = async (config) => {
      captured.headers = config.headers as Record<string, string>
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    apiClient.defaults.adapter = adapter

    await apiClient.get('/ping')

    expect(captured.headers?.Authorization).toBe('Bearer token-123')
    apiClient.defaults.adapter = originalAdapter
  })

  it('toApiError traduce el detail de FastAPI', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 401, data: { detail: 'Credenciales inválidas' } },
    }

    expect(toApiError(error)).toMatchObject({ status: 401, message: 'Credenciales inválidas' })
  })

  it('toApiError devuelve un mensaje genérico para errores desconocidos', () => {
    expect(toApiError(new Error('boom'))).toEqual({ status: 0, message: 'Error inesperado' })
  })

  it('un 401 borra la sesión y avisa al handler', async () => {
    tokenStorage.setSession('token-123', 'refresh-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    withAdapter((config) => unauthorized(config))

    await expect(apiClient.get('/auth/me')).rejects.toBeInstanceOf(AxiosError)

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getToken()).toBeNull()
  })

  it('un 401 renueva la sesión y repite la petición original', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => {
      if (config.url === '/auth/refresh') return ok(config, renewed)
      if (config.headers?.Authorization === 'Bearer token-nuevo') return ok(config, { ok: true })
      return unauthorized(config)
    })

    const { data } = await apiClient.get('/memberships')

    expect(data).toEqual({ ok: true })
    expect(urls).toEqual(['/memberships', '/auth/refresh', '/memberships'])
    expect(tokenStorage.getToken()).toBe('token-nuevo')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('varias peticiones a la vez provocan un solo refresco', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-123', user)
    const failed = new Set<string>()

    const urls = withAdapter((config) => {
      if (config.url === '/auth/refresh') return ok(config, renewed)
      if (config.headers?.Authorization === 'Bearer token-nuevo') return ok(config, {})
      // The first attempt of every URL fails; its retry does not.
      if (failed.has(config.url ?? '')) return ok(config, {})
      failed.add(config.url ?? '')
      return unauthorized(config)
    })

    await Promise.all([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')])

    // Three failing requests share a single refresh and then each is repeated once: 3 + 1 + 3.
    expect(urls.filter((url) => url === '/auth/refresh')).toHaveLength(1)
    expect(urls).toHaveLength(7)
  })

  it('no intenta refrescar cuando el 401 viene del login', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => unauthorized(config))

    await expect(apiClient.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError)

    // A wrong password reaches the form as it is: no refresh, and nobody is logged out.
    expect(urls).toEqual(['/auth/login'])
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(tokenStorage.getToken()).toBe('token-viejo')
  })

  it('excluye el login aunque la URL lleve el prefijo del baseURL', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => unauthorized(config))

    await expect(apiClient.post('/api/v1/auth/login', {})).rejects.toBeInstanceOf(AxiosError)

    expect(urls).toEqual(['/api/v1/auth/login'])
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('un 401 tras haber refrescado cierra la sesión', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => {
      if (config.url === '/auth/refresh') return ok(config, renewed)
      return unauthorized(config) // the retry with the brand-new token is rejected too
    })

    await expect(apiClient.get('/memberships')).rejects.toBeInstanceOf(AxiosError)

    expect(urls).toEqual(['/memberships', '/auth/refresh', '/memberships'])
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('no entra en bucle cuando el propio refresco devuelve 401', async () => {
    tokenStorage.setSession('token-viejo', 'refresh-caducado', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => unauthorized(config))

    await expect(apiClient.get('/auth/me')).rejects.toBeInstanceOf(AxiosError)

    expect(urls.filter((url) => url === '/auth/refresh')).toHaveLength(1)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('sin token de refresco no se intenta renovar', async () => {
    tokenStorage.setToken('token-123')
    tokenStorage.setUser(user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const urls = withAdapter((config) => unauthorized(config))

    await expect(apiClient.get('/auth/me')).rejects.toBeInstanceOf(AxiosError)

    expect(urls).toEqual(['/auth/me'])
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})
