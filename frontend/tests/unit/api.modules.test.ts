import type { AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import { authApi, membershipsApi, schedulesApi } from '@/api'
import { apiClient } from '@/api/client'
import { tokenStorage } from '@/auth/tokenStorage'

type Captured = { url?: string; method?: string }

const originalAdapter = apiClient.defaults.adapter

function captureAdapter(captured: Captured, body: unknown = {}): AxiosAdapter {
  return async (config) => {
    captured.url = config.url
    captured.method = config.method
    return { data: body, status: 200, statusText: 'OK', headers: {}, config }
  }
}

describe('api modules', () => {
  afterEach(() => {
    tokenStorage.clear()
    apiClient.defaults.adapter = originalAdapter
  })

  it('authApi.register hace POST a /auth/register', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await authApi.register({ email: 'a@b.c', full_name: 'A', password: 'secret123' })

    expect(captured).toMatchObject({ url: '/auth/register', method: 'post' })
  })

  it('schedulesApi.list hace GET a /class-schedules', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], meta: {} })

    await schedulesApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/class-schedules', method: 'get' })
  })

  it('membershipsApi.mine hace GET a /members/me/membership', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await membershipsApi.mine()

    expect(captured).toMatchObject({ url: '/members/me/membership', method: 'get' })
  })
})
