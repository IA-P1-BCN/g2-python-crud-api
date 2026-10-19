import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toApiError } from '@/api'
import { SessionList } from '@/components/ui/organisms/SessionList'
import { WeekSelector } from '@/components/ui/organisms/WeekSelector'
import { toIsoDate } from '@/lib/dates'
import { formatDate } from '@/lib/format'
import { useMemberSessions } from './useMemberSessions'

export function ClassesPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()))
  const { sessions, sessionDates, isLoading, isError, error } = useMemberSessions(selectedDate)

  const items = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    time: session.time,
    room: session.room,
    enrolled: session.enrolled,
    capacity: session.capacity,
    state: session.state,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Reservas</h1>
        <span className="text-small text-text-muted">Semana del {formatDate(selectedDate)}</span>
      </div>

      <WeekSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        sessionDates={sessionDates}
      />

      <SessionList
        sessions={items}
        role="member"
        isLoading={isLoading}
        error={isError ? toApiError(error).message : null}
        emptyMessage="No hay sesiones para este día."
        onAction={(id) => navigate(`/member/sessions/${id}?date=${selectedDate}`)}
      />
    </div>
  )
}
