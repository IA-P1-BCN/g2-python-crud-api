import { useQuery } from '@tanstack/react-query'
import { bookingsApi, classesApi, MAX_PAGE_SIZE, roomsApi, schedulesApi } from '@/api'
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
 * Uses only endpoints a member may call: the schedule, its class (with `trainer_name`), the
 * session's availability, the rooms list, and the member's own bookings.
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
    queryFn: () => roomsApi.list({ size: MAX_PAGE_SIZE }),
  })
  const availability = useQuery({
    queryKey: ['availability', scheduleId, date],
    enabled: scheduleId !== null,
    queryFn: () => schedulesApi.availability(scheduleId as number, date),
  })
  const userId = user?.id
  const myBookings = useQuery({
    queryKey: ['my-bookings', userId],
    enabled: userId !== undefined,
    queryFn: () => bookingsApi.listAllForUser(userId as number),
  })

  let detail: SessionDetail | null = null
  if (schedule.data && gymClass.data) {
    const scheduleItem = schedule.data
    const classItem = gymClass.data
    const myBooking = (myBookings.data ?? []).find(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.schedule_id === scheduleItem.id &&
        booking.booking_date === date,
    )
    const capacity = availability.data?.capacity ?? classItem.capacity
    const enrolled = availability.data?.booked ?? 0
    const available = availability.data?.available ?? capacity

    detail = {
      id: scheduleItem.id,
      title: classItem.name,
      date: formatDate(date),
      time: `${formatTime(scheduleItem.start_time)} – ${formatTime(scheduleItem.end_time)}`,
      trainerName: classItem.trainer_name,
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

  const queries = [schedule, gymClass, rooms, availability, myBookings]

  return {
    detail,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.error)?.error ?? null,
  }
}
