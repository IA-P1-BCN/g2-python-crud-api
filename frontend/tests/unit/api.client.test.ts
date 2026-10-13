import { AxiosError, type AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient, setUnauthorizedHandler, toApiError } from '@/api/client'
import { tokenStorage } from '@/auth/tokenStorage'
import type { User } from '@/types/api'

const user: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

describe('apiClient', () => {
  afterEach(() => {
    tokenStorage.clear()
    setUnauthorizedHandler(null)
  })

  it('añade la cabecera Authorization con el token guardado', async () => {
    tokenStorage.setSession('token-123', user)

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
    tokenStorage.setSession('token-123', user)
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)

    const originalAdapter = apiClient.defaults.adapter
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { detail: 'No autenticado' },
      })
    }
    apiClient.defaults.adapter = adapter

    await expect(apiClient.get('/auth/me')).rejects.toBeInstanceOf(AxiosError)

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getToken()).toBeNull()

    apiClient.defaults.adapter = originalAdapter
  })
})
