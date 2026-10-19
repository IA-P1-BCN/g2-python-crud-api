import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, roomsApi, schedulesApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { startOfWeek, toIsoDate } from '@/lib/dates'
import { ClassesPage } from '@/pages/member/ClassesPage'
import type { Booking, ClassSchedule, GymClass, Room, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  MAX_PAGE_SIZE: 100,
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn(), availability: vi.fn() },
  roomsApi: { list: vi.fn() },
  // `list` stays mocked only to prove the page never calls it (staff only in the API)
  bookingsApi: { list: vi.fn(), listAllForUser: vi.fn(), create: vi.fn(), cancel: vi.fn() },
  toApiError: (error: unknown) => ({ status: 400, message: String(error) }),
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
  capacity: 2,
  trainer_id: 2,
  trainer_name: 'Entrenador Uno',
  room_id: 1,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

// Monday, so clicking the "Lun" chip selects it deterministically.
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
  booking_date: '',
  status: 'confirmed',
  created_at: '2026-10-05T09:00:00Z',
}

function spots(available: number) {
  return { schedule_id: 10, on_date: '', capacity: 2, booked: 2 - available, available }
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
      <MemoryRouter initialEntries={['/member/classes']}>
        <Routes>
          <Route path="/member/classes" element={<ClassesPage />} />
          <Route path="/member/sessions/:scheduleId" element={<div>detalle de la sesión</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function page<T>(items: T[], size = 100) {
  return { items, total: items.length, page: 1, size, pages: 1 }
}

async function selectMonday() {
  await userEvent.click(await screen.findByRole('button', { name: /^Lun / }))
}

describe('ClassesPage (reservas del socio)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(schedulesApi.list).mockResolvedValue(page([schedule]))
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
    vi.mocked(schedulesApi.availability).mockResolvedValue(spots(1))
    vi.mocked(bookingsApi.listAllForUser).mockResolvedValue([])
  })

  it('muestra la sesión del día con sala y plazas libres', async () => {
    renderPage()
    await selectMonday()

    expect(screen.getByRole('heading', { name: 'Reservas' })).toBeInTheDocument()
    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(await screen.findByText('1 plazas libres')).toBeInTheDocument()
  })

  it('solo usa endpoints que un socio puede llamar, sin pedir más de 100', async () => {
    renderPage()
    await selectMonday()
    await screen.findByText('Yoga')

    expect(bookingsApi.list).not.toHaveBeenCalled()
    expect(bookingsApi.listAllForUser).toHaveBeenCalledWith(member.id)
    expect(schedulesApi.availability).toHaveBeenCalledWith(10, expect.any(String))
    for (const list of [classesApi.list, schedulesApi.list, roomsApi.list]) {
      expect(list).toHaveBeenCalledWith({ size: 100 })
    }
  })

  it('marca como reservada la sesión que el socio ya tiene ese día', async () => {
    // The "Lun" chip is the Monday of the current week
    const monday = startOfWeek(toIsoDate(new Date()))
    vi.mocked(bookingsApi.listAllForUser).mockResolvedValue([
      { ...myBooking, booking_date: monday },
    ])
    renderPage()
    await selectMonday()

    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(await screen.findByText('Reservada')).toBeInTheDocument()
  })

  it('marca la sesión llena cuando no quedan plazas', async () => {
    vi.mocked(schedulesApi.availability).mockResolvedValue(spots(0))
    renderPage()
    await selectMonday()

    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(await screen.findByText('Completa')).toBeInTheDocument()
  })

  it('abre el detalle de la sesión al pulsar "Ver detalle"', async () => {
    renderPage()
    await selectMonday()

    await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle' }))

    expect(await screen.findByText('detalle de la sesión')).toBeInTheDocument()
  })
})
