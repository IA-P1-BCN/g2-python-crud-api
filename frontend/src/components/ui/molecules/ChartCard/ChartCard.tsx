import type { ReactNode } from 'react'
import { Badge, type BadgeTone } from '@/components/ui/atoms/Badge'
import { cn } from '@/lib/cn'

export type ChartCardTone = 'surface' | 'secondary'

export type ChartCardBadge = {
  label: string
  tone?: BadgeTone
}

export type ChartCardProps = {
  title: string
  /** Optional line under the title. */
  subtitle?: string
  /** Optional badge next to the title. */
  badge?: ChartCardBadge
  /** `secondary` is the blue feature card. */
  tone?: ChartCardTone
  className?: string
  children: ReactNode
}

const TONE: Record<ChartCardTone, string> = {
  surface: 'bg-surface text-text',
  secondary: 'bg-secondary text-white',
}

/** Card shell for the dashboard blocks: title, subtitle, optional badge and a body slot. */
export function ChartCard({
  title,
  subtitle,
  badge,
  tone = 'surface',
  className,
  children,
}: ChartCardProps) {
  return (
    <section
      aria-label={title}
      className={cn('flex flex-col gap-4 rounded-card p-6', TONE[tone], className)}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-title">{title}</h2>
          {subtitle ? (
            <p
              className={cn(
                'text-small',
                tone === 'secondary' ? 'text-white/80' : 'text-text-muted',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {badge ? (
          <Badge tone={badge.tone ?? (tone === 'secondary' ? 'secondary' : 'neutral')}>
            {badge.label}
          </Badge>
        ) : null}
      </header>

      {children}
    </section>
  )
}
