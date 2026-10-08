import { Badge, Button } from '@/components/ui'

export type SessionAttendee = {
  id: number
  name: string
}

export type SessionState = 'available' | 'booked' | 'full'

export type SessionRole = 'trainer' | 'member'

export type SessionCardProps = {
  /** Name of the gym class. */
  title: string
  /** Already formatted time range, e.g. "10:00 – 11:00". */
  time: string
  /** Room label, e.g. "Sala 1". */
  room: string
  /** Confirmed bookings for the session. */
  enrolled: number
  /** Class capacity. */
  capacity: number
  /** People enrolled, used for the avatar stack. */
  attendees?: SessionAttendee[]
  /** Trainer cards show an action button; member cards show free spots and state. */
  role: SessionRole
  /** Booking state, only meaningful for the member variant. */
  state?: SessionState
  /** Trainer action, e.g. open the enrolled members panel. */
  onAction?: () => void
  className?: string
}

const AVATAR_LIMIT = 3

const STATE_LABEL: Record<SessionState, string> = {
  available: 'Plazas libres',
  booked: 'Reservada',
  full: 'Completa',
}

const STATE_TONE: Record<SessionState, 'info' | 'success' | 'danger'> = {
  available: 'info',
  booked: 'success',
  full: 'danger',
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function SessionCard({
  title,
  time,
  room,
  enrolled,
  capacity,
  attendees = [],
  role,
  state = 'available',
  onAction,
  className = '',
}: SessionCardProps) {
  const free = Math.max(capacity - enrolled, 0)
  const shown = attendees.slice(0, AVATAR_LIMIT)
  const hidden = attendees.length - shown.length

  return (
    <article className={`card session-card ${className}`.trim()}>
      <header className="session-card__header">
        <h3 className="session-card__title">{title}</h3>
        <span className="session-card__meta">
          {time} · {room}
        </span>
      </header>

      <p className="session-card__capacity">
        {enrolled} / {capacity} inscritos
      </p>
      <progress
        className="progress"
        value={enrolled}
        max={capacity}
        aria-label="Ocupación de la sesión"
      />

      {shown.length > 0 ? (
        <div className="session-card__attendees" aria-label={`${attendees.length} inscritos`}>
          {shown.map((attendee) => (
            <span key={attendee.id} className="avatar session-card__avatar" aria-hidden="true">
              {initials(attendee.name)}
            </span>
          ))}
          {hidden > 0 ? (
            <span
              className="avatar session-card__avatar session-card__avatar--more"
              aria-hidden="true"
            >
              +{hidden}
            </span>
          ) : null}
        </div>
      ) : null}

      {role === 'trainer' ? (
        <Button variant="primary" onClick={onAction}>
          Ver inscritos
        </Button>
      ) : (
        <div className="session-card__status">
          <Badge tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Badge>
          <span className="card__meta">{free > 0 ? `${free} plazas libres` : 'Sin plazas'}</span>
        </div>
      )}
    </article>
  )
}
