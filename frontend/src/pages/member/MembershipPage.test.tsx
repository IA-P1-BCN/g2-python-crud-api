import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { membershipPlansApi, membershipsApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { MembershipPage } from '@/pages/member/MembershipPage'
import type {
  Membership,
  MembershipPage as MembershipPageResult,
  MembershipPlan,
  MembershipPlanPage,
  User,
} from '@/types/api'

vi.mock('@/api', () => ({
  membershipsApi: { listForUser: vi.fn() },
  membershipPlansApi: { list: vi.fn() },
  toApiError: vi.fn((error: unknown) => ({ message: (error as Error).message })),
}))
vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

const mockedUseAuth = vi.mocked(useAuth)
const mockedListForUser = vi.mocked(membershipsApi.listForUser)
const mockedListPlans = vi.mocked(membershipPlansApi.list)

const member: User = {
  id: 7,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
  deactivated_at: null,
}

const membership: Membership = {
  id: 3,
  user_id: 7,
  plan_id: 2,
  start_date: '2026-10-01',
  end_date: '2026-10-31',
  status: 'active',
  created_at: '2026-10-01T10:00:00Z',
}

const plan: MembershipPlan = {
  id: 2,
  name: 'Mensual',
  description: 'Acceso completo durante 30 días',
  price_cents: 3999,
  duration_days: 30,
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
}

function membershipPage(items: Membership[]): MembershipPageResult {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function planPage(items: MembershipPlan[]): MembershipPlanPage {
  return { items, total: items.length, page: 1, size: 100, pages: 1 }
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

describe('MembershipPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Only the clock is faked: the queries still resolve through real timers.
    vi.useFakeTimers({ now: new Date('2026-10-10T12:00:00Z'), toFake: ['Date'] })
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
    mockedListPlans.mockResolvedValue(planPage([plan]))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra la tarjeta con el plan, el estado y los días restantes', async () => {
    mockedListForUser.mockResolvedValue(membershipPage([membership]))

    render(<MembershipPage />, { wrapper })

    expect(await screen.findByRole('heading', { name: 'Mensual' })).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByText('Termina el 31/10/2026')).toBeInTheDocument()
    expect(screen.getByText('21 días restantes')).toBeInTheDocument()

    const progress = screen.getByRole('progressbar', { name: 'Días restantes' })
    expect(progress).toHaveAttribute('aria-valuenow', '21')
    expect(progress).toHaveAttribute('aria-valuemax', '30')

    expect(screen.getByRole('heading', { name: 'Tu plan incluye' })).toBeInTheDocument()
    expect(screen.getByText('Acceso a todas las clases dirigidas')).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no tiene membresía', async () => {
    mockedListForUser.mockResolvedValue(membershipPage([]))

    render(<MembershipPage />, { wrapper })

    expect(await screen.findByText('No tienes ninguna membresía asignada.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Mensual' })).not.toBeInTheDocument()
  })

  it('muestra los skeletons mientras carga la membresía', () => {
    mockedListForUser.mockReturnValue(new Promise<MembershipPageResult>(() => {}))

    const { container } = render(<MembershipPage />, { wrapper })

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2)
    expect(screen.queryByText('No tienes ninguna membresía asignada.')).not.toBeInTheDocument()
  })

  it('muestra el error de la API', async () => {
    mockedListForUser.mockRejectedValue(new Error('boom'))

    render(<MembershipPage />, { wrapper })

    expect(await screen.findByRole('alert')).toHaveTextContent('boom')
  })
})
