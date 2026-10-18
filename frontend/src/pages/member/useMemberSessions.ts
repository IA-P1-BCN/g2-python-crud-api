import { useQueries, useQuery } from '@tanstack/react-query'
import { bookingsApi, classesApi, MAX_PAGE_SIZE, roomsApi, schedulesApi } from '@/api'
import { useAuth } from '@/auth'
import type { SessionState } from '@/components/ui/molecules/SessionCard'
import { addDays, parseIsoDate, startOfWeek } from '@/lib/dates'
import { formatTime } from '@/lib/format'

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
 * Uses only endpoints a member may call: the public schedules, classes (with `trainer_name`)
 * and per-session availability, the rooms list, and the member's own bookings.
 */
export function useMemberSessions(selectedDate: string): UseMemberSessionsResult {
  const { user } = useAuth()

  const schedules = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: () => schedulesApi.list({ size: MAX_PAGE_SIZE }),
  })
  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: MAX_PAGE_SIZE }),
  })
  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: MAX_PAGE_SIZE }),
  })
  const userId = user?.id
  const myBookings = useQuery({
    queryKey: ['my-bookings', userId],
    enabled: userId !== undefined,
    queryFn: () => bookingsApi.listAllForUser(userId as number),
  })

  const allSchedules = schedules.data?.items ?? []
  const weekday = weekdayOf(selectedDate)
  const daySchedules = allSchedules
    .filter((schedule) => schedule.day_of_week === weekday)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const availability = useQueries({
    queries: daySchedules.map((schedule) => ({
      queryKey: ['availability', schedule.id, selectedDate],
      queryFn: () => schedulesApi.availability(schedule.id, selectedDate),
    })),
  })

  const classMap = new Map((classes.data?.items ?? []).map((item) => [item.id, item]))
  const roomMap = new Map((rooms.data?.items ?? []).map((item) => [item.id, item.name]))
  const myBookingBySchedule = new Map(
    (myBookings.data ?? [])
      .filter((booking) => booking.status === 'confirmed' && booking.booking_date === selectedDate)
      .map((booking) => [booking.schedule_id, booking.id]),
  )

  const sessions: MemberSession[] = daySchedules.map((schedule, index) => {
    const gymClass = classMap.get(schedule.class_id)
    const spots = availability.at(index)?.data
    const capacity = spots?.capacity ?? gymClass?.capacity ?? 0
    const enrolled = spots?.booked ?? 0
    const available = spots?.available ?? capacity
    const bookingId = myBookingBySchedule.get(schedule.id) ?? null
    const state: SessionState =
      bookingId !== null ? 'booked' : available <= 0 ? 'full' : 'available'

    return {
      id: schedule.id,
      title: gymClass?.name ?? `Clase #${schedule.class_id}`,
      time: `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`,
      room: schedule.room_id ? (roomMap.get(schedule.room_id) ?? `Sala #${schedule.room_id}`) : '—',
      trainerName: gymClass?.trainer_name ?? '—',
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

  const queries = [schedules, classes, rooms, myBookings, ...availability]

  return {
    sessions,
    sessionDates,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.error)?.error ?? null,
  }
}
