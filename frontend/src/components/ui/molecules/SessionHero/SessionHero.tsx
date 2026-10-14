import { Avatar } from '@/components/ui/atoms/Avatar'
import { ProgressBar } from '@/components/ui/atoms/ProgressBar'
import { cn } from '@/lib/cn'

export type SessionHeroProps = {
  title: string
  /** Already formatted date. */
  date: string
  /** Already formatted time range. */
  time: string
  trainerName: string
  room: string
  enrolled: number
  capacity: number
  className?: string
}

export function SessionHero({
  title,
  date,
  time,
  trainerName,
  room,
  enrolled,
  capacity,
  className,
}: SessionHeroProps) {
  const free = Math.max(capacity - enrolled, 0)

  return (
    <section
      className={cn('flex flex-col gap-3 rounded-card bg-secondary p-6 text-white', className)}
      aria-label="Sesión"
    >
      <h2 className="font-display text-headline">{title}</h2>

      <div className="flex items-center gap-2">
        <Avatar name={trainerName} size="sm" />
        <span className="text-body">{trainerName}</span>
      </div>

      <p className="text-body text-white/90">
        {date} · {time} · {room}
      </p>

      <ProgressBar
        value={enrolled}
        max={capacity}
        variant="secondary-soft"
        label="Ocupación de la sesión"
      />
      <p className="text-small text-white/90">
        {enrolled} de {capacity} plazas · {free} libres
      </p>
    </section>
  )
}
