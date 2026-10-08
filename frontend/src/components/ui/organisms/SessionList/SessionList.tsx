import {
  SessionCard,
  type SessionCardProps,
  type SessionRole,
} from '@/components/ui/molecules/SessionCard'
import { Alert } from '@/components/ui'

export type SessionListItem = Omit<SessionCardProps, 'role' | 'onAction' | 'className'> & {
  id: number
}

export type SessionListProps = {
  sessions: SessionListItem[]
  /** Role all the cards are rendered for. */
  role: SessionRole
  isLoading?: boolean
  /** Error message to show instead of the list. */
  error?: string | null
  emptyMessage?: string
  /** Called with the id of the session whose action button was pressed. */
  onAction?: (id: number) => void
  skeletonCount?: number
  className?: string
}

const DEFAULT_SKELETONS = 3

export function SessionList({
  sessions,
  role,
  isLoading = false,
  error = null,
  emptyMessage = 'No hay sesiones.',
  onAction,
  skeletonCount = DEFAULT_SKELETONS,
  className = '',
}: SessionListProps) {
  if (isLoading) {
    return (
      <ul
        className={`session-list ${className}`.trim()}
        aria-busy="true"
        aria-label="Cargando sesiones"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <li key={index} className="session-list__skeleton" aria-hidden="true" />
        ))}
      </ul>
    )
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>
  }

  if (sessions.length === 0) {
    return <p className={`session-list__empty ${className}`.trim()}>{emptyMessage}</p>
  }

  return (
    <ul className={`session-list ${className}`.trim()}>
      {sessions.map(({ id, ...card }) => (
        <li key={id}>
          <SessionCard {...card} role={role} onAction={onAction ? () => onAction(id) : undefined} />
        </li>
      ))}
    </ul>
  )
}
