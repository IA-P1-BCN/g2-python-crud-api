import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, meApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { MemberHomePage } from '@/pages/member/MemberHomePage'
import type { MemberDashboard, User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  meApi: { dashboard: vi.fn() },
  bookingsApi: { cancel: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
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

const dashboard: MemberDashboard = {
  membership: {
    membership_id: 5,
    plan_id: 2,
    plan_name: 'Mensual',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    status: 'active',
    days_left: 22,
  },
  upcoming_bookings: [
    {
      booking_id: 7,
      booking_date: '2026-10-06',
      schedule_id: 3,
      class_id: 1,
      class_name: 'Yoga',
      start_time: '10:00:00',
      end_time: '11:00:00',
      room_name: 'Sala 1',
      trainer_name: 'Ana López',
    },
  ],
  stats: { bookings_this_month: 3, total_bookings: 10 },
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
        <MemberHomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MemberHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
    vi.mocked(meApi.dashboard).mockResolvedValue(dashboard)
    vi.mocked(bookingsApi.cancel).mockResolvedValue()
  })

  it('muestra la membresía, la próxima reserva y los accesos rápidos', async () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Hola, Socio Uno' })).toBeInTheDocument()
    expect(await screen.findByText(/Mensual/)).toBeInTheDocument()
    expect(screen.getByText(/22 días restantes/)).toBeInTheDocument()
    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('Entrenador: Ana López')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reservas' })).toHaveAttribute(
      'href',
      '/member/bookings',
    )
    expect(screen.getByRole('link', { name: 'Mi plan' })).toHaveAttribute(
      'href',
      '/member/membership',
    )
  })

  it('cancela la próxima reserva', async () => {
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar reserva' }))

    expect(bookingsApi.cancel).toHaveBeenCalledWith(7)
  })
})
