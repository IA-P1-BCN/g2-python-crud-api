import { Badge } from '@/components/ui'

export type CapacitySummaryProps = {
  /** Confirmed bookings for the session. */
  enrolled: number
  /** Class capacity. */
  capacity: number
  className?: string
}

export function CapacitySummary({ enrolled, capacity, className = '' }: CapacitySummaryProps) {
  const percentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0

  return (
    <div className={`capacity-summary ${className}`.trim()}>
      <div className="capacity-summary__header">
        <span className="capacity-summary__count">
          {enrolled} / {capacity}
        </span>
        <Badge tone="info">{percentage}%</Badge>
      </div>
      <progress
        className="progress"
        value={enrolled}
        max={capacity > 0 ? capacity : 1}
        aria-label="Ocupación"
      />
    </div>
  )
}
