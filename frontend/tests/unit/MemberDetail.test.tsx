import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, membershipsApi } from '@/api'
import { MemberDetail } from '@/pages/admin/members/MemberDetail'
import type { Booking, BookingPage, Membership, MembershipPage, User } from '@/types/api'

vi.mock('@/api', () => ({
  membershipsApi: { listForUser: vi.fn() },
  bookingsApi: { listForUser: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const member: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const membership: Membership = {
  id: 5,
  user_id: 1,
  plan_id: 2,
  start_date: '2026-10-01',
  end_date: '2026-10-31',
  status: 'active',
  created_at: '2026-10-01T10:00:00Z',
}

const booking: Booking = {
  id: 7,
  member_id: 1,
  schedule_id: 3,
  booking_date: '2026-10-06',
  status: 'confirmed',
  created_at: '2026-10-01T10:00:00Z',
}

const membershipsPage: MembershipPage = {
  items: [membership],
  total: 1,
  page: 1,
  size: 100,
  pages: 1,
}

const bookingsPage: BookingPage = {
  items: [booking],
  total: 1,
  page: 1,
  size: 100,
  pages: 1,
}

function renderDetail() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemberDetail member={member} onClose={() => {}} />
    </QueryClientProvider>,
  )
}

describe('MemberDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(membershipsApi.listForUser).mockResolvedValue(membershipsPage)
    vi.mocked(bookingsApi.listForUser).mockResolvedValue(bookingsPage)
  })

  it('muestra la ficha con las dos secciones, cada una con su tabla', async () => {
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Membresías' })).toBeInTheDocument()
    expect(await screen.findAllByRole('table')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Reservas' })).toBeInTheDocument()
    expect(screen.getByText(/socio@example\.com/)).toBeInTheDocument()
  })

  it('pinta cada conjunto de filas en su propia tabla', async () => {
    renderDetail()

    const [memberships, bookings] = await screen.findAllByRole('table')
    expect(within(memberships).getByText('Plan #2')).toBeInTheDocument()
    expect(within(memberships).getByText('Activa')).toBeInTheDocument()
    expect(within(bookings).getByText('#3')).toBeInTheDocument()
    expect(within(bookings).getByText('Confirmada')).toBeInTheDocument()
  })

  it('consulta las membresías y las reservas del socio', async () => {
    renderDetail()
    await screen.findByRole('heading', { name: 'Membresías' })

    expect(membershipsApi.listForUser).toHaveBeenCalledWith(1, { size: 100 })
    expect(bookingsApi.listForUser).toHaveBeenCalledWith(1, { size: 100 })
  })
})
