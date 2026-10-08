import type { AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import {
  adminApi,
  authApi,
  bookingsApi,
  classesApi,
  membershipPlansApi,
  membershipsApi,
  roomsApi,
  schedulesApi,
} from '@/api'
import { apiClient } from '@/api/client'
import { tokenStorage } from '@/auth/tokenStorage'

type Captured = { url?: string; method?: string; params?: Record<string, unknown> }

const originalAdapter = apiClient.defaults.adapter

function captureAdapter(captured: Captured, body: unknown = {}): AxiosAdapter {
  return async (config) => {
    captured.url = config.url
    captured.method = config.method
    captured.params = config.params as Record<string, unknown> | undefined
    return { data: body, status: 200, statusText: 'OK', headers: {}, config }
  }
}

describe('api modules', () => {
  afterEach(() => {
    tokenStorage.clear()
    apiClient.defaults.adapter = originalAdapter
  })

  it('usa /api/v1 como prefijo por defecto o el valor de VITE_API_URL', () => {
    const expected = import.meta.env.VITE_API_URL ?? '/api/v1'
    expect(apiClient.defaults.baseURL).toBe(expected)
  })

  it('authApi.register hace POST a /auth/register', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await authApi.register({ email: 'a@b.c', full_name: 'A', password: 'secret123' })

    expect(captured).toMatchObject({ url: '/auth/register', method: 'post' })
  })

  it('adminApi.dashboard hace GET a /admin/dashboard con el periodo', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured)

    await adminApi.dashboard('30d')

    expect(captured).toMatchObject({
      url: '/admin/dashboard',
      method: 'get',
      params: { period: '30d' },
    })
  })

  it('schedulesApi.list hace GET a /class-schedules', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await schedulesApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/class-schedules', method: 'get' })
  })

  it('roomsApi.list hace GET a /rooms', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await roomsApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/rooms', method: 'get' })
  })

  it('membershipPlansApi.list hace GET a /membership-plans', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await membershipPlansApi.list({ page: 1, size: 10 })

    expect(captured).toMatchObject({ url: '/membership-plans', method: 'get' })
  })

  it('membershipPlansApi.list puede filtrar por active_only', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await membershipPlansApi.list({ active_only: true, size: 100 })

    expect(captured.params).toMatchObject({ active_only: true, size: 100 })
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

  it('classesApi.list filtra por trainer_id', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await classesApi.list({ trainer_id: 2, size: 100 })

    expect(captured).toMatchObject({ url: '/classes', method: 'get' })
    expect(captured.params).toMatchObject({ trainer_id: 2, size: 100 })
  })

  it('bookingsApi.list filtra por sesión y fecha', async () => {
    const captured: Captured = {}
    apiClient.defaults.adapter = captureAdapter(captured, { items: [], total: 0, pages: 1 })

    await bookingsApi.list({ schedule_id: 1, on_date: '2026-10-06', size: 100 })

    expect(captured).toMatchObject({ url: '/bookings', method: 'get' })
    expect(captured.params).toMatchObject({ schedule_id: 1, on_date: '2026-10-06' })
  })
})
