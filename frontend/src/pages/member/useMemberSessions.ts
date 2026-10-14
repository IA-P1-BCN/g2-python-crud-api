import { useQuery } from '@tanstack/react-query'
import { bookingsApi, classesApi, roomsApi, schedulesApi, usersApi } from '@/api'
import { useAuth } from '@/auth'
import type { SessionState } from '@/components/ui/molecules/SessionCard'
import { addDays, parseIsoDate, startOfWeek } from '@/lib/dates'
import { formatTime } from '@/lib/format'

const PAGE_SIZE = 200
const DAYS_IN_WEEK = 7

export type MemberSession = {
  /** Schedule id. */
  id: number
  title: string
  time: string
  room: string
  trainerName: string
  capacity: number
  enrolled: number
  available: number
  state: SessionState
  /** The member's own booking for this session, if any. */
  bookingId: number | null
}

export type UseMemberSessionsResult = {
  sessions: MemberSession[]
  /** ISO dates of the selected week that have sessions, for the week selector. */
  sessionDates: string[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

function weekdayOf(isoDate: string): number {
  return (parseIsoDate(isoDate).getDay() + 6) % 7
}

/**
 * Sessions of the selected day with their free spots and the member's booking state.
 *
 * Composes the public schedules/classes/rooms/users endpoints with the day's bookings
 * (`GET /bookings?on_date=`), so free spots and "already booked" come from real data.
 */
export function useMemberSessions(selectedDate: string): UseMemberSessionsResult {
  const { user } = useAuth()

  const schedules = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: () => schedulesApi.list({ size: PAGE_SIZE }),
  })
  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: PAGE_SIZE }),
  })
  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: PAGE_SIZE }),
  })
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ size: PAGE_SIZE }),
  })
  const bookings = useQuery({
    queryKey: ['member-sessions-bookings', selectedDate],
    queryFn: () => bookingsApi.list({ on_date: selectedDate, size: PAGE_SIZE }),
  })

  const classMap = new Map((classes.data?.items ?? []).map((item) => [item.id, item]))
  const roomMap = new Map((rooms.data?.items ?? []).map((item) => [item.id, item.name]))
  const userMap = new Map((users.data?.items ?? []).map((item) => [item.id, item.full_name]))

  const confirmedBySchedule = new Map<number, number>()
  const myBookingBySchedule = new Map<number, number>()
  for (const booking of bookings.data?.items ?? []) {
    if (booking.status !== 'confirmed') continue
    confirmedBySchedule.set(
      booking.schedule_id,
      (confirmedBySchedule.get(booking.schedule_id) ?? 0) + 1,
    )
    if (booking.member_id === user?.id) {
      myBookingBySchedule.set(booking.schedule_id, booking.id)
    }
  }

  const allSchedules = schedules.data?.items ?? []
  const weekday = weekdayOf(selectedDate)

  const sessions: MemberSession[] = allSchedules
    .filter((schedule) => schedule.day_of_week === weekday)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((schedule) => {
      const gymClass = classMap.get(schedule.class_id)
      const capacity = gymClass?.capacity ?? 0
      const enrolled = confirmedBySchedule.get(schedule.id) ?? 0
      const available = Math.max(capacity - enrolled, 0)
      const bookingId = myBookingBySchedule.get(schedule.id) ?? null
      const state: SessionState =
        bookingId !== null ? 'booked' : available <= 0 ? 'full' : 'available'

      return {
        id: schedule.id,
        title: gymClass?.name ?? `Clase #${schedule.class_id}`,
        time: `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`,
        room: schedule.room_id
          ? (roomMap.get(schedule.room_id) ?? `Sala #${schedule.room_id}`)
          : '—',
        trainerName: gymClass
          ? (userMap.get(gymClass.trainer_id) ?? `Entrenador #${gymClass.trainer_id}`)
          : '—',
        capacity,
        enrolled,
        available,
        state,
        bookingId,
      }
    })

  const scheduledWeekdays = new Set(allSchedules.map((schedule) => schedule.day_of_week))
  const monday = startOfWeek(selectedDate)
  const sessionDates = Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    addDays(monday, index),
  ).filter((isoDate) => scheduledWeekdays.has(weekdayOf(isoDate)))

  const isError =
    schedules.isError || classes.isError || rooms.isError || users.isError || bookings.isError

  return {
    sessions,
    sessionDates,
    isLoading:
      schedules.isLoading ||
      classes.isLoading ||
      rooms.isLoading ||
      users.isLoading ||
      bookings.isLoading,
    isError,
    error: schedules.error ?? classes.error ?? rooms.error ?? users.error ?? bookings.error ?? null,
  }
}
