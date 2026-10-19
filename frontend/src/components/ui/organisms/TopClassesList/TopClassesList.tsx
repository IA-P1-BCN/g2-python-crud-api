import { Badge } from '@/components/ui/atoms/Badge'
import { ChartCard } from '@/components/ui/molecules/ChartCard'
import type { PopularClass } from '@/types/api'

export type TopClassesListProps = {
  classes: PopularClass[]
  className?: string
}

/** Ranked classes by number of bookings. No ratings. */
export function TopClassesList({ classes, className }: TopClassesListProps) {
  return (
    <ChartCard title="Clases más populares" className={className}>
      {classes.length === 0 ? (
        <p className="text-body text-text-muted">No hay reservas en este periodo.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {classes.map((item, index) => (
            <li key={item.class_id} className="flex items-center gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-display text-small text-text-soft">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-body text-text">{item.name}</span>
              <Badge tone="neutral">{item.bookings}</Badge>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  )
}
