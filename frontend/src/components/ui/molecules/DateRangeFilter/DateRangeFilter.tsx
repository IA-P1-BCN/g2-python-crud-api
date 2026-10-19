import { cn } from '@/lib/cn'
import type { DashboardPeriod } from '@/types/api'

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
]

export type DateRangeFilterProps = {
  value: DashboardPeriod
  onChange: (value: DashboardPeriod) => void
  className?: string
}

/** Segmented control for the dashboard period (today / 7 days / 30 days). */
export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Periodo"
      className={cn('inline-flex gap-1 rounded-full bg-surface-sunken p-1', className)}
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-4 py-2 font-display text-small transition-colors',
              isActive ? 'bg-primary text-ink' : 'text-text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
