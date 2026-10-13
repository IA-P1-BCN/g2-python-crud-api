import { useQuery } from '@tanstack/react-query'
import { meApi } from '@/api'
import type { MemberDashboard } from '@/types/api'

export type UseMemberDashboardResult = {
  dashboard: MemberDashboard | null
  isLoading: boolean
  isError: boolean
  error: unknown
}

/** Current member's dashboard: membership, upcoming bookings and stats. */
export function useMemberDashboard(): UseMemberDashboardResult {
  const query = useQuery({
    queryKey: ['member', 'dashboard'],
    queryFn: () => meApi.dashboard(),
  })

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
