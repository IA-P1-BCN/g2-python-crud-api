import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { membershipPlansApi, membershipsApi, usersApi } from '@/api'
import { AdminMembershipsPage } from '@/pages/admin/AdminMembershipsPage'
import type { Membership, MembershipPlan, User } from '@/types/api'

vi.mock('@/api', () => ({
  membershipsApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  membershipPlansApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
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

const plan: MembershipPlan = {
  id: 1,
  name: 'Mensual',
  description: null,
  price_cents: 3999,
  duration_days: 30,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const membership: Membership = {
  id: 1,
  user_id: 1,
  plan_id: 1,
  start_date: '2026-10-01',
  end_date: '2026-10-31',
  status: 'active',
  created_at: '2026-10-01T10:00:00Z',
}

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminMembershipsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminMembershipsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(membershipsApi.list).mockResolvedValue(page([membership]))
    vi.mocked(membershipPlansApi.list).mockResolvedValue(page([plan]))
    vi.mocked(usersApi.list).mockResolvedValue(page([member]))
  })

  it('lista las membresías con socio y plan', async () => {
    renderPage()

    expect((await screen.findAllByText('Socio Uno')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Mensual/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0)
  })

  it('asigna una membresía', async () => {
    vi.mocked(membershipsApi.create).mockResolvedValue(membership)
    renderPage()
    await screen.findAllByText('Socio Uno')

    await userEvent.click(screen.getByRole('button', { name: 'Asignar membresía' }))
    const form = screen.getByRole('form', { name: 'Asignar membresía' })
    await userEvent.selectOptions(within(form).getByLabelText('Socio'), '1')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(membershipsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, plan_id: 1 }),
      ),
    )
  })

  it('filtra por estado', async () => {
    renderPage()
    await screen.findAllByText('Socio Uno')

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'active')

    await waitFor(() =>
      expect(membershipsApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ status_filter: 'active' }),
      ),
    )
  })
})
