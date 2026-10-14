import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, roomsApi, schedulesApi, usersApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { useTrainerToday } from '@/pages/trainer/useTrainerToday'
import type { Booking, ClassSchedule, GymClass, Room, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))
vi.mock('@/api', () => ({
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
  bookingsApi: { list: vi.fn() },
  roomsApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
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

// 2026-10-14 is a Wednesday (weekday 2).
const todaySchedule: ClassSchedule = {
  id: 10,
  class_id: 1,
  day_of_week: 2,
  start_time: '10:00:00',
  end_time: '11:00:00',
  room_id: 1,
  created_at: '2026-10-01T10:00:00Z',
}

const fridaySchedule: ClassSchedule = {
  id: 11,
  class_id: 1,
  day_of_week: 4,
  start_time: '18:00:00',
  end_time: '19:00:00',
  room_id: 1,
  created_at: '2026-10-01T10:00:00Z',
}

const bookings: Booking[] = [
  {
    id: 100,
    member_id: 5,
    schedule_id: 10,
    booking_date: '2026-10-14',
    status: 'confirmed',
    created_at: '2026-10-13T09:00:00Z',
  },
  {
    id: 101,
    member_id: 6,
    schedule_id: 10,
    booking_date: '2026-10-14',
    status: 'cancelled',
    created_at: '2026-10-13T09:05:00Z',
  },
  {
    id: 102,
    member_id: 7,
    schedule_id: 11,
    booking_date: '2026-10-14',
    status: 'confirmed',
    created_at: '2026-10-13T09:10:00Z',
  },
]

const rooms: Room[] = [{ id: 1, name: 'Sala 1', capacity: 20 }]

const members: User[] = [
  { ...trainer, id: 5, email: 'a@example.com', full_name: 'Socio Cinco', role: 'member' },
  { ...trainer, id: 6, email: 'b@example.com', full_name: 'Socio Seis', role: 'member' },
  { ...trainer, id: 7, email: 'c@example.com', full_name: 'Socio Siete', role: 'member' },
]

const NOW = new Date(2026, 9, 14, 9, 0)

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

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 100, pages: 1 }
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTrainerToday', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: trainer, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(schedulesApi.list).mockResolvedValue(page([todaySchedule, fridaySchedule]))
    vi.mocked(bookingsApi.list).mockResolvedValue(page(bookings))
    vi.mocked(roomsApi.list).mockResolvedValue(page(rooms))
    vi.mocked(usersApi.list).mockResolvedValue(page(members))
  })

  it('resume las sesiones y los miembros de hoy', async () => {
    const { result } = renderHook(() => useTrainerToday(NOW), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(bookingsApi.list).toHaveBeenCalledWith({ on_date: '2026-10-14', size: 100 })
    expect(result.current.sessionCount).toBe(1)
    expect(result.current.memberCount).toBe(1)
    expect(result.current.sessions).toHaveLength(1)
    expect(result.current.sessions[0]).toMatchObject({
      id: 10,
      title: 'Yoga',
      time: '10:00 – 11:00',
      room: 'Sala 1',
      enrolled: 1,
      capacity: 20,
    })
    expect(result.current.sessions[0]?.attendees[0]?.name).toBe('Socio Cinco')
    expect(result.current.nextSession?.id).toBe(10)
  })

  it('marca error cuando fallan las clases', async () => {
    vi.mocked(classesApi.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useTrainerToday(NOW), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
