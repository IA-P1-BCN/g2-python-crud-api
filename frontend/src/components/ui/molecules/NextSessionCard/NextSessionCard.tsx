import { Button } from '@/components/ui/atoms/Button'
import { ProgressBar } from '@/components/ui/atoms/ProgressBar'
import { AvatarStack } from '@/components/ui/molecules/AvatarStack'
import type { SessionAttendee } from '@/components/ui/molecules/SessionCard'
import { cn } from '@/lib/cn'

export type NextSession = {
  id: number
  className: string
  /** Already formatted time range, e.g. "10:00 – 11:00". */
  time: string
  room: string | null
  /** Confirmed bookings for the session. */
  enrolled: number
  /** Class capacity. */
  capacity: number
  /** People enrolled, used for the avatar stack. */
  attendees?: SessionAttendee[]
}

export type NextSessionCardProps = {
  session: NextSession | null
  /** Called with the id of the session whose "Ver inscritos" was pressed. */
  onAction?: (id: number) => void
  /** Message shown when there is no session. */
  emptyMessage?: string
  className?: string
}

export function NextSessionCard({
  session,
  onAction,
  emptyMessage = 'No tienes más sesiones hoy.',
  className,
}: NextSessionCardProps) {
  return (
    <section
      className={cn('flex flex-col gap-3 rounded-card bg-secondary p-6 text-white', className)}
      aria-label="Próxima sesión"
    >
      <h2 className="font-display text-title">Tu próxima sesión</h2>

      {session ? (
        <>
          <p className="font-display text-headline">{session.className}</p>
          <p className="text-body text-white/90">
            {session.time}
            {session.room ? ` · ${session.room}` : ''}
          </p>
          <ProgressBar
            value={session.enrolled}
            max={session.capacity}
            variant="secondary-soft"
            label="Ocupación de la sesión"
          />
          <p className="text-small text-white/90">
            {session.enrolled} de {session.capacity} plazas
          </p>
          {session.attendees && session.attendees.length > 0 ? (
            <AvatarStack people={session.attendees} />
          ) : null}
          <Button className="self-start" onClick={() => onAction?.(session.id)}>
            Ver inscritos
          </Button>
        </>
      ) : (
        <p className="text-body text-white/90">{emptyMessage}</p>
      )}
    </section>
  )
}
