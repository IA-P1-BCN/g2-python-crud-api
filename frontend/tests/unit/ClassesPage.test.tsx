import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, roomsApi, schedulesApi, usersApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { ClassesPage } from '@/pages/member/ClassesPage'
import type { Booking, ClassSchedule, GymClass, Room, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
  roomsApi: { list: vi.fn() },
  bookingsApi: { list: vi.fn(), create: vi.fn(), cancel: vi.fn() },
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({
    status: 400,
    message: error instanceof Error ? error.message : 'Error',
  }),
}))

const mockedUseAuth = vi.mocked(useAuth)

const member: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

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
  capacity: 2,
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

const room: Room = { id: 1, name: 'Sala 1', capacity: 20 }

const otherBooking: Booking = {
  id: 500,
  member_id: 99,
  schedule_id: 10,
  booking_date: '2026-10-05',
  status: 'confirmed',
  created_at: '2026-10-05T09:00:00Z',
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
      <ClassesPage />
    </QueryClientProvider>,
  )
}

function page<T>(items: T[], size = 100) {
  return { items, total: items.length, page: 1, size, pages: 1 }
}

describe('ClassesPage (calendario)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(schedulesApi.list).mockResolvedValue(page([schedule]))
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
    vi.mocked(usersApi.list).mockResolvedValue(page([member, trainer]))
    vi.mocked(bookingsApi.list).mockResolvedValue(page([otherBooking]))
  })

  it('muestra la sesión con instructor, sala y plazas libres calculadas', async () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Calendario de clases' })).toBeInTheDocument()
    expect(await screen.findAllByText('Yoga')).not.toHaveLength(0)
    expect(screen.getAllByText(/Entrenador Uno/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sala 1/).length).toBeGreaterThan(0)
    // aforo 2 - 1 reserva confirmada = 1 plaza libre
    expect(screen.getAllByText(/1 libres/).length).toBeGreaterThan(0)
    expect(schedulesApi.list).toHaveBeenCalledWith({ day_of_week: expect.any(Number), size: 100 })
  })

  it('reserva la sesión seleccionada', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue({
      ...otherBooking,
      id: 501,
      member_id: member.id,
    })
    renderPage()

    await screen.findAllByText('Yoga')
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(bookingsApi.create).toHaveBeenCalledWith({
      member_id: member.id,
      schedule_id: schedule.id,
      booking_date: expect.any(String),
    })
  })

  it('muestra el mensaje de error de la API', async () => {
    vi.mocked(bookingsApi.create).mockRejectedValue(
      new Error('No hay plazas disponibles en esta sesión'),
    )
    renderPage()

    await screen.findAllByText('Yoga')
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(await screen.findByText('No hay plazas disponibles en esta sesión')).toBeInTheDocument()
  })
})
