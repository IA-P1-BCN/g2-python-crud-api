import { useQuery } from '@tanstack/react-query'
import { bookingsApi, usersApi } from '@/api'
import type { EnrolledMember } from '@/components/organisms/EnrolledMembersPanel'
import { formatClock } from '@/lib/format'

const PAGE_SIZE = 100

export type UseEnrolledMembersResult = {
  members: EnrolledMember[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Confirmed members booked in a schedule on a given date.
 *
 * The backend has no dedicated "enrolled members" endpoint yet, so this composes
 * `GET /bookings?schedule_id=&on_date=` with `GET /users?role=member` for names.
 */
export function useEnrolledMembers(
  scheduleId: number | null,
  date: string,
): UseEnrolledMembersResult {
  const bookings = useQuery({
    queryKey: ['trainer', 'enrolled-members', scheduleId, date],
    enabled: scheduleId !== null,
    queryFn: () =>
      bookingsApi.list({ schedule_id: scheduleId ?? undefined, on_date: date, size: PAGE_SIZE }),
  })

  const users = useQuery({
    queryKey: ['users', 'members'],
    queryFn: () => usersApi.list({ role: 'member', size: PAGE_SIZE }),
  })

  const names = new Map((users.data?.items ?? []).map((user) => [user.id, user.full_name]))

  const members: EnrolledMember[] = (bookings.data?.items ?? [])
    .filter((booking) => booking.status === 'confirmed')
    .map((booking) => ({
      id: booking.id,
      name: names.get(booking.member_id) ?? `Socio #${booking.member_id}`,
      memberNumber: booking.member_id,
      time: formatClock(booking.created_at),
    }))

  return {
    members,
    isLoading: bookings.isLoading || users.isLoading,
    isError: bookings.isError || users.isError,
    error: bookings.error ?? users.error ?? null,
  }
}
