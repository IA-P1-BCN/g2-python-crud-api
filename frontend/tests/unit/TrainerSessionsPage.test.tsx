import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, schedulesApi, usersApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { TrainerSessionsPage } from '@/pages/trainer/TrainerSessionsPage'
import type { Booking, ClassSchedule, GymClass, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
  bookingsApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
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

const booking: Booking = {
  id: 100,
  member_id: 1,
  schedule_id: 10,
  booking_date: '2026-10-06',
  status: 'confirmed',
  created_at: '2026-10-06T09:00:00Z',
}

const member: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
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

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TrainerSessionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TrainerSessionsPage', () => {
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
    vi.mocked(bookingsApi.list).mockResolvedValue({
      items: [booking],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [member],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  it('muestra solo las clases del propio entrenador', async () => {
    renderPage()

    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(classesApi.list).toHaveBeenCalledWith({ trainer_id: trainer.id, size: 100 })
  })

  it('lista los miembros inscritos en la sesión seleccionada', async () => {
    renderPage()

    expect(await screen.findByText('Socio Uno')).toBeInTheDocument()
    expect(screen.getByText('socio@example.com')).toBeInTheDocument()
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
    expect(bookingsApi.list).toHaveBeenCalledWith({
      schedule_id: schedule.id,
      on_date: expect.any(String),
      size: 100,
    })
  })
})
