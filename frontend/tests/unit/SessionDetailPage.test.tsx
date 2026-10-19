import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, roomsApi, schedulesApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { SessionDetailPage } from '@/pages/member/SessionDetailPage'
import type { Booking, ClassSchedule, GymClass, Room, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  MAX_PAGE_SIZE: 100,
  schedulesApi: { get: vi.fn(), availability: vi.fn() },
  classesApi: { get: vi.fn() },
  roomsApi: { list: vi.fn() },
  // `list` stays mocked only to prove the page never calls it (staff only in the API)
  bookingsApi: { list: vi.fn(), listAllForUser: vi.fn(), create: vi.fn(), cancel: vi.fn() },
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

const room: Room = { id: 1, name: 'Sala 1', capacity: 20 }

const myBooking: Booking = {
  id: 500,
  member_id: 1,
  schedule_id: 10,
  booking_date: '2026-10-06',
  status: 'confirmed',
  created_at: '2026-10-06T09:00:00Z',
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

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 100, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/member/sessions/10?date=2026-10-06']}>
        <Routes>
          <Route path="/member/sessions/:scheduleId" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SessionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(schedulesApi.get).mockResolvedValue(schedule)
    vi.mocked(classesApi.get).mockResolvedValue(gymClass)
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
    vi.mocked(schedulesApi.availability).mockResolvedValue({
      schedule_id: 10,
      on_date: '2026-10-06',
      capacity: 20,
      booked: 5,
      available: 15,
    })
    vi.mocked(bookingsApi.listAllForUser).mockResolvedValue([])
  })

  it('muestra los detalles de la sesión', async () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Detalles de la sesión' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Yoga' })).toBeInTheDocument()
    expect(screen.getByText('Entrenador Uno')).toBeInTheDocument()
    expect(screen.getByText('06/10/2026 · 10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(screen.getByText('5 de 20 plazas · 15 libres')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reservar' })).toBeInTheDocument()
  })

  it('solo usa endpoints que un socio puede llamar', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Yoga' })

    expect(bookingsApi.list).not.toHaveBeenCalled()
    expect(schedulesApi.availability).toHaveBeenCalledWith(10, '2026-10-06')
    expect(bookingsApi.listAllForUser).toHaveBeenCalledWith(member.id)
    expect(roomsApi.list).toHaveBeenCalledWith({ size: 100 })
  })

  it('marca la sesión llena cuando no quedan plazas', async () => {
    vi.mocked(schedulesApi.availability).mockResolvedValue({
      schedule_id: 10,
      on_date: '2026-10-06',
      capacity: 20,
      booked: 20,
      available: 0,
    })
    renderPage()

    expect(await screen.findByText('Sin plazas')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reservar' })).not.toBeInTheDocument()
  })

  it('no toma por suya una reserva de otra fecha', async () => {
    vi.mocked(bookingsApi.listAllForUser).mockResolvedValue([
      { ...myBooking, booking_date: '2026-10-13' },
    ])
    renderPage()

    expect(await screen.findByRole('button', { name: 'Reservar' })).toBeInTheDocument()
  })

  it('reserva la sesión', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(myBooking)
    renderPage()
    await screen.findByRole('heading', { name: 'Yoga' })

    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(bookingsApi.create).toHaveBeenCalledWith({
      member_id: member.id,
      schedule_id: schedule.id,
      booking_date: '2026-10-06',
    })
  })

  it('cancela la reserva del socio', async () => {
    vi.mocked(bookingsApi.listAllForUser).mockResolvedValue([myBooking])
    vi.mocked(bookingsApi.cancel).mockResolvedValue()
    renderPage()
    await screen.findByRole('heading', { name: 'Yoga' })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar reserva' }))

    expect(bookingsApi.cancel).toHaveBeenCalledWith(myBooking.id)
  })

  it('muestra el error de la regla de reserva', async () => {
    vi.mocked(bookingsApi.create).mockRejectedValue(new Error('No quedan plazas'))
    renderPage()
    await screen.findByRole('heading', { name: 'Yoga' })

    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(await screen.findByText('No quedan plazas')).toBeInTheDocument()
  })
})
