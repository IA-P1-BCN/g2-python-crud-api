import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classesApi, schedulesApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { useTrainerSessions } from '@/pages/trainer/useTrainerSessions'
import type { ClassSchedule, GymClass, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))
vi.mock('@/api', () => ({
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
}))

const mockedUseAuth = vi.mocked(useAuth)

const trainer: User = {
  id: 2,
  email: 'trainer@example.com',
  full_name: 'Entrenador Uno',
  role: 'trainer',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const gymClass: GymClass = {
  id: 1,
  name: 'Yoga',
  capacity: 20,
  trainer_id: 2,
  room_id: 1,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const schedule: ClassSchedule = {
  id: 10,
  class_id: 1,
  day_of_week: 0,
  start_time: '10:00:00',
  end_time: '11:00:00',
  room_id: 1,
  created_at: '2026-10-01T10:00:00Z',
}

function authValue(partial: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    hasRole: vi.fn(),
    ...partial,
  }
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTrainerSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: trainer, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(classesApi.list).mockResolvedValue({
      items: [gymClass],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(schedulesApi.list).mockResolvedValue({
      items: [schedule],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  it('combina las clases y los horarios del entrenador', async () => {
    const { result } = renderHook(() => useTrainerSessions(), { wrapper })

    await waitFor(() => expect(result.current.sessions).toHaveLength(1))

    expect(result.current.sessions[0]?.gymClass.name).toBe('Yoga')
    expect(result.current.sessions[0]?.schedule.id).toBe(schedule.id)
    expect(classesApi.list).toHaveBeenCalledWith({ trainer_id: trainer.id, size: 100 })
    expect(schedulesApi.list).toHaveBeenCalledWith({ class_id: gymClass.id, size: 100 })
  })

  it('marca error cuando fallan las clases', async () => {
    vi.mocked(classesApi.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useTrainerSessions(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
