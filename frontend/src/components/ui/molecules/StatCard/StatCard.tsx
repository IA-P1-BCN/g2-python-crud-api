import { Badge, type BadgeTone } from '@/components/ui/atoms/Badge'
import { ProgressBar, type ProgressBarVariant } from '@/components/ui/atoms/ProgressBar'
import { cn } from '@/lib/cn'

export type StatCardVariant = 'surface' | 'secondary'
export type StatDeltaTone = 'success' | 'danger' | 'neutral'

export type StatCardDelta = {
  /** Already formatted, e.g. "+12" or "-8". */
  value: string
  tone?: StatDeltaTone
}

export type StatCardProgress = {
  value: number
  max?: number
  variant?: ProgressBarVariant
}

export type StatCardProps = {
  label: string
  value: string | number
  /** Optional line under the value, e.g. "12 membresías en vigor". */
  hint?: string
  /** Optional change badge next to the number. */
  delta?: StatCardDelta
  /** Optional progress bar. */
  progress?: StatCardProgress
  variant?: StatCardVariant
  className?: string
}

const VARIANT_CLASS: Record<StatCardVariant, string> = {
  surface: 'bg-surface',
  secondary: 'bg-secondary text-text',
}

const DELTA_TONE: Record<StatDeltaTone, BadgeTone> = {
  success: 'success',
  danger: 'danger',
  neutral: 'neutral',
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  progress,
  variant = 'surface',
  className,
}: StatCardProps) {
  return (
    <article
      className={cn('flex flex-col gap-2 rounded-card p-4', VARIANT_CLASS[variant], className)}
    >
      <h2 className="text-caption uppercase tracking-wide text-text-muted">{label}</h2>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-metric text-text">{value}</span>
        {delta ? <Badge tone={DELTA_TONE[delta.tone ?? 'neutral']}>{delta.value}</Badge> : null}
      </div>

      {hint ? <p className="text-small text-text-muted">{hint}</p> : null}

      {progress ? (
        <ProgressBar
          value={progress.value}
          max={progress.max}
          variant={progress.variant ?? 'primary'}
          label={`${label} (progreso)`}
        />
      ) : null}
    </article>
  )
}
