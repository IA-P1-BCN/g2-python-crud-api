import { useQuery } from '@tanstack/react-query'
import { bookingsApi, roomsApi, usersApi } from '@/api'
import type { SessionAttendee } from '@/components/ui/molecules/SessionCard'
import { toIsoDate, weekdayOf } from '@/lib/dates'
import { formatTime } from '@/lib/format'
import { useTrainerSessions } from './useTrainerSessions'

const PAGE_SIZE = 100

export type TrainerTodaySession = {
  /** Schedule id. */
  id: number
  /** Class name. */
  title: string
  /** Already formatted time range. */
  time: string
  room: string
  enrolled: number
  capacity: number
  attendees: SessionAttendee[]
}

export type UseTrainerTodayResult = {
  /** Sessions scheduled for today. */
  sessionCount: number
  /** Confirmed members booked in today's sessions. */
  memberCount: number
  /** Current or next session of today, if any. */
  nextSession: TrainerTodaySession | null
  /** Today's sessions, sorted by start time. */
  sessions: TrainerTodaySession[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Today's summary for the logged-in trainer: the sessions of today's weekday
 * with their confirmed members and the next session still to run.
 *
 * Reuses `useTrainerSessions` (trainer classes and schedules) and composes it
 * with today's bookings, the rooms and the member names, since the backend has
 * no single "trainer today" endpoint yet.
 */
export function useTrainerToday(now: Date = new Date()): UseTrainerTodayResult {
  const today = toIsoDate(now)
  const weekday = weekdayOf(now)

  const {
    sessions,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    error: sessionsError,
  } = useTrainerSessions()

  const bookings = useQuery({
    queryKey: ['trainer', 'today-bookings', today],
    queryFn: () => bookingsApi.list({ on_date: today, size: PAGE_SIZE }),
  })

  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: PAGE_SIZE }),
  })

  const members = useQuery({
    queryKey: ['users', 'members'],
    queryFn: () => usersApi.list({ role: 'member', size: PAGE_SIZE }),
  })

  const roomNames = new Map((rooms.data?.items ?? []).map((room) => [room.id, room.name]))
  const memberNames = new Map((members.data?.items ?? []).map((user) => [user.id, user.full_name]))

  const todaySessions = sessions
    .filter((session) => session.schedule.day_of_week === weekday)
    .sort((a, b) => a.schedule.start_time.localeCompare(b.schedule.start_time))

  const todayScheduleIds = new Set(todaySessions.map((session) => session.schedule.id))

  const confirmed = (bookings.data?.items ?? []).filter(
    (booking) => booking.status === 'confirmed' && todayScheduleIds.has(booking.schedule_id),
  )

  const attendeesBySchedule = new Map<number, SessionAttendee[]>()
  for (const booking of confirmed) {
    const attendees = attendeesBySchedule.get(booking.schedule_id) ?? []
    attendees.push({
      id: booking.member_id,
      name: memberNames.get(booking.member_id) ?? `Socio #${booking.member_id}`,
    })
    attendeesBySchedule.set(booking.schedule_id, attendees)
  }

  const items: TrainerTodaySession[] = todaySessions.map(({ gymClass, schedule }) => {
    const attendees = attendeesBySchedule.get(schedule.id) ?? []
    return {
      id: schedule.id,
      title: gymClass.name,
      time: `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`,
      room: schedule.room_id
        ? (roomNames.get(schedule.room_id) ?? `Sala #${schedule.room_id}`)
        : '—',
      enrolled: attendees.length,
      capacity: gymClass.capacity,
      attendees,
    }
  })

  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const nextIndex = todaySessions.findIndex(
    (session) => formatTime(session.schedule.end_time) >= clock,
  )

  return {
    sessionCount: items.length,
    memberCount: confirmed.length,
    nextSession: nextIndex === -1 ? null : (items[nextIndex] ?? null),
    sessions: items,
    isLoading: isLoadingSessions || bookings.isLoading || rooms.isLoading || members.isLoading,
    isError: isSessionsError || bookings.isError || rooms.isError || members.isError,
    error: sessionsError ?? bookings.error ?? rooms.error ?? members.error ?? null,
  }
}
