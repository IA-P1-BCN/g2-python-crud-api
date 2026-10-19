import { useNavigate } from 'react-router-dom'
import { toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Alert } from '@/components/ui/molecules/Alert'
import { NextSessionCard, type NextSession } from '@/components/ui/molecules/NextSessionCard'
import { ProfileGreeting } from '@/components/ui/molecules/ProfileGreeting'
import { StatCard } from '@/components/ui/molecules/StatCard'
import { SessionList, type SessionListItem } from '@/components/ui/organisms/SessionList'
import { toIsoDate } from '@/lib/dates'
import { formatDate } from '@/lib/format'
import { useTrainerToday } from './useTrainerToday'

export function TrainerHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { sessionCount, memberCount, nextSession, sessions, isLoading, isError, error } =
    useTrainerToday()

  const openSessions = () => navigate('/trainer/sessions')

  const next: NextSession | null = nextSession
    ? {
        id: nextSession.id,
        className: nextSession.title,
        time: nextSession.time,
        room: nextSession.room,
        enrolled: nextSession.enrolled,
        capacity: nextSession.capacity,
        attendees: nextSession.attendees,
      }
    : null

  const items: SessionListItem[] = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    time: session.time,
    room: session.room,
    enrolled: session.enrolled,
    capacity: session.capacity,
    attendees: session.attendees,
  }))

  return (
    <div className="flex flex-col gap-8">
      <ProfileGreeting
        name={user?.full_name ?? 'entrenador'}
        subtitle={formatDate(toIsoDate(new Date()))}
      />

      {isError ? (
        <Alert variant="error">{toApiError(error).message}</Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Sesiones hoy" value={sessionCount} />
            <StatCard label="Miembros hoy" value={memberCount} />
          </div>

          <NextSessionCard session={next} onAction={openSessions} />

          <section className="flex flex-col gap-3" aria-label="Sesiones de hoy">
            <h2 className="font-display text-title text-text">Sesiones de hoy</h2>
            <SessionList
              sessions={items}
              role="trainer"
              isLoading={isLoading}
              emptyMessage="No tienes sesiones hoy."
              onAction={openSessions}
            />
          </section>
        </>
      )}
    </div>
  )
}
