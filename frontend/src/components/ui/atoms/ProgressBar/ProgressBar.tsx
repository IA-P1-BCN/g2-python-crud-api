import { cn } from '@/lib/cn'

export type ProgressBarVariant = 'primary' | 'secondary-soft' | 'muted'

const FILL_CLASS: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary',
  'secondary-soft': 'bg-secondary-soft',
  muted: 'bg-text-muted',
}

export type ProgressBarProps = {
  /** Current value, between 0 and `max`. */
  value: number
  max?: number
  /** Colour of the fill. */
  variant?: ProgressBarVariant
  /** Accessible name. */
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  label,
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1
  const clamped = Math.min(Math.max(value, 0), safeMax)

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-line', className)}
    >
      <div
        className={cn('h-full rounded-full transition-all', FILL_CLASS[variant])}
        style={{ width: `${(clamped / safeMax) * 100}%` }}
      />
    </div>
  )
}
