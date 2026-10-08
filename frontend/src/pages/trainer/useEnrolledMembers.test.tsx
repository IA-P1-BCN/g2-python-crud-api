import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, usersApi } from '@/api'
import { useEnrolledMembers } from '@/pages/trainer/useEnrolledMembers'
import type { Booking, User } from '@/types/api'

vi.mock('@/api', () => ({
  bookingsApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
}))

const confirmed: Booking = {
  id: 1,
  member_id: 7,
  schedule_id: 10,
  booking_date: '2026-10-06',
  status: 'confirmed',
  created_at: '2026-10-06T09:15:00Z',
}

const cancelled: Booking = {
  id: 2,
  member_id: 8,
  schedule_id: 10,
  booking_date: '2026-10-06',
  status: 'cancelled',
  created_at: '2026-10-06T09:20:00Z',
}

const member: User = {
  id: 7,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useEnrolledMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingsApi.list).mockResolvedValue({
      items: [confirmed, cancelled],
      total: 2,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [member],
      total: 1,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  it('devuelve solo los inscritos confirmados con su nombre y hora', async () => {
    const { result } = renderHook(() => useEnrolledMembers(10, '2026-10-06'), { wrapper })

    await waitFor(() => expect(result.current.members).toHaveLength(1))

    expect(result.current.members[0]).toMatchObject({ id: 1, name: 'Socio Uno', memberNumber: 7 })
    expect(result.current.members[0]?.time).toMatch(/^\d{2}:\d{2}$/)
    expect(bookingsApi.list).toHaveBeenCalledWith({
      schedule_id: 10,
      on_date: '2026-10-06',
      size: 100,
    })
  })

  it('no consulta reservas si no hay horario seleccionado', async () => {
    const { result } = renderHook(() => useEnrolledMembers(null, '2026-10-06'), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(bookingsApi.list).not.toHaveBeenCalled()
  })
})
