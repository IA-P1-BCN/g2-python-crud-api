import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { membershipPlansApi, membershipsApi, paymentsApi, usersApi } from '@/api'
import { useAdminMembers } from '@/pages/admin/members/useAdminMembers'
import type { Membership, MembershipPlan, Payment, User } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: { list: vi.fn() },
  membershipPlansApi: { list: vi.fn() },
  membershipsApi: { listForUser: vi.fn() },
  paymentsApi: { list: vi.fn() },
}))

const member: User = {
  id: 1,
  email: 'ana@test.dev',
  full_name: 'Ana López',
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

const plan: MembershipPlan = {
  id: 2,
  name: 'Mensual',
  description: null,
  price_cents: 3999,
  duration_days: 30,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const payment: Payment = {
  id: 9,
  user_id: 1,
  membership_id: 5,
  amount_cents: 3999,
  status: 'paid',
  created_at: '2026-10-02T09:00:00Z',
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useAdminMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [member],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    })
    vi.mocked(membershipPlansApi.list).mockResolvedValue({
      items: [plan],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(membershipsApi.listForUser).mockResolvedValue({
      items: [membership],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(paymentsApi.list).mockResolvedValue({
      items: [payment],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  it('enriquece cada socio con su plan, membresía y último pago', async () => {
    const { result } = renderHook(() => useAdminMembers({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.members).toHaveLength(1))

    expect(result.current.members[0]).toMatchObject({
      id: 1,
      name: 'Ana López',
      planName: 'Mensual',
      membershipStatus: 'active',
      lastPayment: { amountCents: 3999, status: 'paid' },
    })
    expect(usersApi.list).toHaveBeenCalledWith({
      role: 'member',
      page: 1,
      size: 10,
      search: undefined,
      is_active: undefined,
    })
  })

  it('deja el plan y el pago a null si el socio no tiene datos', async () => {
    vi.mocked(membershipsApi.listForUser).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(paymentsApi.list).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 100,
      pages: 1,
    })

    const { result } = renderHook(() => useAdminMembers({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.members).toHaveLength(1))

    expect(result.current.members[0]?.planName).toBeNull()
    expect(result.current.members[0]?.lastPayment).toBeNull()
  })
})
