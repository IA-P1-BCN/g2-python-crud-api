import type { AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import { authApi, bookingsApi, membershipPlansApi, membershipsApi, schedulesApi } from '@/api'
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

  it('usa /api/v1 como prefijo por defecto', () => {
    expect(apiClient.defaults.baseURL).toBe('/api/v1')
  })

  it('authApi.register hace POST a /auth/register', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await authApi.register({ email: 'a@b.c', full_name: 'A', password: 'secret123' })

    expect(captured).toMatchObject({ url: '/auth/register', method: 'post' })
  })

  it('schedulesApi.list hace GET a /class-schedules', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await schedulesApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/class-schedules', method: 'get' })
  })

  it('membershipPlansApi.list hace GET a /membership-plans', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await membershipPlansApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/membership-plans', method: 'get' })
  })

  it('membershipsApi.listForUser hace GET a /users/{id}/memberships', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await membershipsApi.listForUser(7, { page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/users/7/memberships', method: 'get' })
  })

  it('bookingsApi.cancel hace DELETE a /bookings/{id}', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await bookingsApi.cancel(3)

    expect(captured).toMatchObject({ url: '/bookings/3', method: 'delete' })
  })
})
