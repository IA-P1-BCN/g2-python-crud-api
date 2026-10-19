import { ChartCard } from '@/components/ui/molecules/ChartCard'
import { parseIsoDate, weekdayOf } from '@/lib/dates'
import { shortDayLabel } from '@/lib/format'
import type { DailyBookings } from '@/types/api'

export type BookingsByDayChartProps = {
  days: DailyBookings[]
  className?: string
}

const CHART_HEIGHT = 'h-24'

/** Weekly bar chart of the bookings per day, on a blue card, with the peak highlighted. */
export function BookingsByDayChart({ days, className }: BookingsByDayChartProps) {
  const max = days.reduce((top, day) => Math.max(top, day.count), 0)

  return (
    <ChartCard
      title="Reservas por día"
      tone="secondary"
      badge={max > 0 ? { label: `Máx. ${max}` } : undefined}
      className={className}
    >
      {days.length === 0 ? (
        <p className="text-body text-white/80">Sin reservas en este periodo.</p>
      ) : (
        <ul className="flex items-end gap-2">
          {days.map((day) => {
            const isPeak = max > 0 && day.count === max
            const height = max > 0 ? Math.round((day.count / max) * 100) : 0
            return (
              <li key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-caption text-white/90">{day.count}</span>
                <span className={`flex ${CHART_HEIGHT} w-full items-end`}>
                  <span
                    className={`w-full rounded-tile ${isPeak ? 'bg-primary' : 'bg-white/30'}`}
                    style={{ height: `${height}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-caption text-white/70">
                  {shortDayLabel(weekdayOf(parseIsoDate(day.day)))}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </ChartCard>
  )
}
