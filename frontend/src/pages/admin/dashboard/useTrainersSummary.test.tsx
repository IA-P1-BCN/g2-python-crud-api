import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classesApi, schedulesApi, usersApi } from '@/api'
import { useTrainersSummary } from '@/pages/admin/dashboard/useTrainersSummary'
import type { ClassSchedule, GymClass, User } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: { list: vi.fn() },
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
}))

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
  trainer_name: 'Entrenador Uno',
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

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 100, pages: 1 }
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTrainersSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockResolvedValue(page([trainer]))
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(schedulesApi.list).mockResolvedValue(page([schedule]))
  })

  it('cuenta las sesiones semanales de cada entrenador activo', async () => {
    const { result } = renderHook(() => useTrainersSummary(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(usersApi.list).toHaveBeenCalledWith({ role: 'trainer', is_active: true, size: 100 })
    expect(classesApi.list).toHaveBeenCalledWith({ trainer_id: 2, size: 100 })
    expect(schedulesApi.list).toHaveBeenCalledWith({ class_id: 1, size: 100 })
    expect(result.current.trainers).toEqual([{ id: 2, name: 'Entrenador Uno', sessions: 1 }])
  })

  it('marca error cuando fallan los entrenadores', async () => {
    vi.mocked(usersApi.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useTrainersSummary(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
