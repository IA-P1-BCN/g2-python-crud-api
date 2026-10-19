import { ProgressBar } from '@/components/ui/atoms/ProgressBar'
import { ChartCard } from '@/components/ui/molecules/ChartCard'
import { formatPercent } from '@/lib/format'
import type { ClassOccupancy } from '@/types/api'

export type OccupancyListProps = {
  averageRate: number
  classes: ClassOccupancy[]
  className?: string
}

/** Per-class occupancy with a progress bar and the average as a badge. */
export function OccupancyList({ averageRate, classes, className }: OccupancyListProps) {
  return (
    <ChartCard
      title="Ocupación de clases"
      badge={{ label: formatPercent(averageRate) }}
      className={className}
    >
      {classes.length === 0 ? (
        <p className="text-body text-text-muted">No hay sesiones en este periodo.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {classes.map((item) => (
            <li key={item.class_id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-body text-text">{item.name}</span>
                <span className="text-small text-text-muted">
                  {item.booked} / {item.capacity}
                </span>
              </div>
              <ProgressBar
                value={item.booked}
                max={item.capacity}
                label={`Ocupación de ${item.name}`}
              />
              <span className="text-small text-text-muted">{formatPercent(item.rate)}</span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
