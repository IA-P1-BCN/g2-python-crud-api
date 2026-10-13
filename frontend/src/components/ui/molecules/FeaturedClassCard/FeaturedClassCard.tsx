import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type FeaturedClassCardProps = {
  name: string
  /** Already formatted schedule, e.g. "Lunes 10:00 – 11:00". */
  schedule: string
  capacity: number
  trainerName?: string | null
  className?: string
}

export function FeaturedClassCard({
  name,
  schedule,
  capacity,
  trainerName,
  className,
}: FeaturedClassCardProps) {
  return (
    <article className={cn('flex min-w-56 flex-col gap-2 rounded-card bg-surface p-4', className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name="dumbbell" size={20} />
      </span>
      <h3 className="font-display text-title text-text">{name}</h3>
      <p className="text-small text-primary">{schedule}</p>
      {trainerName ? <p className="text-small text-text-muted">{trainerName}</p> : null}
      <p className="text-caption text-text-muted">{capacity} plazas</p>
    </article>
  )
}
