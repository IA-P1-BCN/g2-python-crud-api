import { useQuery } from '@tanstack/react-query'
import { bookingsApi, classesApi, roomsApi, schedulesApi, usersApi } from '@/api'
import { useAuth } from '@/auth'
import type { BookingState } from '@/components/ui/organisms/BookingActionBar'
import { formatDate, formatTime } from '@/lib/format'

export type SessionDetail = {
  id: number
  title: string
  date: string
  time: string
  trainerName: string
  room: string
  capacity: number
  enrolled: number
  available: number
  state: BookingState
  /** The member's own booking for this session, if any. */
  bookingId: number | null
}

export type UseSessionDetailResult = {
  detail: SessionDetail | null
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Detail of one session (a schedule) on a date, with the member's booking state.
 *
 * Composes the schedule/class/rooms/users endpoints with the session's bookings.
 */
export function useSessionDetail(scheduleId: number | null, date: string): UseSessionDetailResult {
  const { user } = useAuth()

  const schedule = useQuery({
    queryKey: ['schedule', scheduleId],
    enabled: scheduleId !== null,
    queryFn: () => schedulesApi.get(scheduleId as number),
  })

  const classId = schedule.data?.class_id
  const gymClass = useQuery({
    queryKey: ['class', classId],
    enabled: classId !== undefined,
    queryFn: () => classesApi.get(classId as number),
  })

  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: 200 }),
  })
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ size: 200 }),
  })
  const bookings = useQuery({
    queryKey: ['session-bookings', scheduleId, date],
    enabled: scheduleId !== null,
    queryFn: () =>
      bookingsApi.list({ schedule_id: scheduleId as number, on_date: date, size: 200 }),
  })

  let detail: SessionDetail | null = null
  if (schedule.data && gymClass.data) {
    const scheduleItem = schedule.data
    const classItem = gymClass.data
    const confirmed = (bookings.data?.items ?? []).filter(
      (booking) => booking.status === 'confirmed',
    )
    const myBooking = confirmed.find((booking) => booking.member_id === user?.id)
    const enrolled = confirmed.length
    const capacity = classItem.capacity
    const available = Math.max(capacity - enrolled, 0)

    detail = {
      id: scheduleItem.id,
      title: classItem.name,
      date: formatDate(date),
      time: `${formatTime(scheduleItem.start_time)} – ${formatTime(scheduleItem.end_time)}`,
      trainerName:
        (users.data?.items ?? []).find((item) => item.id === classItem.trainer_id)?.full_name ??
        `Entrenador #${classItem.trainer_id}`,
      room: scheduleItem.room_id
        ? ((rooms.data?.items ?? []).find((item) => item.id === scheduleItem.room_id)?.name ??
          `Sala #${scheduleItem.room_id}`)
        : '—',
      capacity,
      enrolled,
      available,
      state: myBooking ? 'booked' : available <= 0 ? 'full' : 'available',
      bookingId: myBooking?.id ?? null,
    }
  }

  const isError =
    schedule.isError || gymClass.isError || rooms.isError || users.isError || bookings.isError

  return {
    detail,
    isLoading:
      schedule.isLoading ||
      gymClass.isLoading ||
      rooms.isLoading ||
      users.isLoading ||
      bookings.isLoading,
    isError,
    error: schedule.error ?? gymClass.error ?? rooms.error ?? users.error ?? bookings.error ?? null,
  }
}
