import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi, roomsApi, toApiError } from '@/api'
import { SessionList, type SessionListItem } from '@/components/organisms/SessionList'
import { WeekSelector } from '@/components/organisms/WeekSelector'
import { addDays, parseIsoDate, startOfWeek, toIsoDate } from '@/lib/dates'
import { formatTime } from '@/lib/format'
import { useTrainerSessions } from './useTrainerSessions'

const PAGE_SIZE = 100
const DAYS_IN_WEEK = 7

function weekdayOf(isoDate: string): number {
  return (parseIsoDate(isoDate).getDay() + 6) % 7
}

export function TrainerSessionsPage() {
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()))

  const {
    sessions,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    error: sessionsError,
  } = useTrainerSessions()

  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: PAGE_SIZE }),
  })

  const bookings = useQuery({
    queryKey: ['trainer', 'sessions', selectedDate],
    queryFn: () => bookingsApi.list({ on_date: selectedDate, size: PAGE_SIZE }),
  })

  const roomNames = new Map((rooms.data?.items ?? []).map((room) => [room.id, room.name]))

  const confirmedBySchedule = new Map<number, number>()
  for (const booking of bookings.data?.items ?? []) {
    if (booking.status === 'confirmed') {
      confirmedBySchedule.set(
        booking.schedule_id,
        (confirmedBySchedule.get(booking.schedule_id) ?? 0) + 1,
      )
    }
  }

  const scheduledWeekdays = new Set(sessions.map((session) => session.schedule.day_of_week))
  const sessionDates = Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    addDays(startOfWeek(selectedDate), index),
  ).filter((isoDate) => scheduledWeekdays.has(weekdayOf(isoDate)))

  const selectedWeekday = weekdayOf(selectedDate)
  const items: SessionListItem[] = sessions
    .filter((session) => session.schedule.day_of_week === selectedWeekday)
    .map(({ gymClass, schedule }) => ({
      id: schedule.id,
      title: gymClass.name,
      time: `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`,
      room: schedule.room_id
        ? (roomNames.get(schedule.room_id) ?? `Sala #${schedule.room_id}`)
        : '—',
      enrolled: confirmedBySchedule.get(schedule.id) ?? 0,
      capacity: gymClass.capacity,
    }))

  const error = isSessionsError
    ? toApiError(sessionsError).message
    : bookings.isError
      ? toApiError(bookings.error).message
      : rooms.isError
        ? toApiError(rooms.error).message
        : null

  return (
    <div className="page">
      <div className="page__header">
        <h1>Mis sesiones</h1>
      </div>

      <WeekSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        sessionDates={sessionDates}
      />

      <SessionList
        sessions={items}
        role="trainer"
        isLoading={isLoadingSessions || bookings.isLoading || rooms.isLoading}
        error={error}
        emptyMessage="No tienes sesiones para este día."
      />
    </div>
  )
}
