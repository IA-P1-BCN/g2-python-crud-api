import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classesApi, membershipPlansApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { HomePage } from '@/pages/public/HomePage'
import { PublicPlansPage } from '@/pages/public/PublicPlansPage'
import type { GymClass, MembershipPlan } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn(), homePathForRole: vi.fn(() => '/') }))

vi.mock('@/api', () => ({
  classesApi: { list: vi.fn() },
  membershipPlansApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const mockedUseAuth = vi.mocked(useAuth)

const gymClass: GymClass = {
  id: 1,
  name: 'Yoga',
  capacity: 20,
  trainer_id: 2,
  room_id: 1,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const plan: MembershipPlan = {
  id: 1,
  name: 'Mensual',
  description: null,
  price_cents: 3999,
  duration_days: 30,
  is_active: true,
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
    hasRole: vi.fn(),
    ...partial,
  }
}

function renderPage(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('public pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(authValue({}))
    vi.mocked(classesApi.list).mockResolvedValue({
      items: [gymClass],
      total: 1,
      page: 1,
      size: 3,
      pages: 1,
    })
    vi.mocked(membershipPlansApi.list).mockResolvedValue({
      items: [plan],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  it('la home muestra la presentación, clases destacadas y CTAs sin sesión', async () => {
    renderPage(<HomePage />)

    expect(screen.getByRole('heading', { name: 'Entrena a tu ritmo' })).toBeInTheDocument()
    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(classesApi.list).toHaveBeenCalledWith({ active_only: true, size: 3 })
  })

  it('la página de planes lista los planes activos con precio y duración', async () => {
    renderPage(<PublicPlansPage />)

    expect(screen.getByRole('heading', { name: 'Planes y precios' })).toBeInTheDocument()
    expect(await screen.findByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText(/39,99/)).toBeInTheDocument()
    expect(screen.getByText('30 días')).toBeInTheDocument()
    expect(membershipPlansApi.list).toHaveBeenCalledWith({ active_only: true, size: 100 })
  })
})
