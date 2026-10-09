import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { meApi } from '@/api'
import { useMemberDashboard } from '@/pages/member/useMemberDashboard'
import type { MemberDashboard } from '@/types/api'

vi.mock('@/api', () => ({ meApi: { dashboard: vi.fn() } }))

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
  upcoming_bookings: [],
  stats: { bookings_this_month: 3, total_bookings: 10 },
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useMemberDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(meApi.dashboard).mockResolvedValue(dashboard)
  })

  it('devuelve el resumen del socio', async () => {
    const { result } = renderHook(() => useMemberDashboard(), { wrapper })

    await waitFor(() => expect(result.current.dashboard).not.toBeNull())

    expect(result.current.dashboard?.membership?.days_left).toBe(22)
    expect(meApi.dashboard).toHaveBeenCalled()
  })
})
