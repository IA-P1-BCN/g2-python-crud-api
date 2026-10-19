import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'

export type PlanCardProps = {
  name: string
  priceCents: number
  durationDays: number
  description?: string | null
  features?: string[]
  /** Blue highlighted variant. */
  highlighted?: boolean
  /** Actions slot (e.g. a sign-up link). */
  children?: ReactNode
  className?: string
}

export function PlanCard({
  name,
  priceCents,
  durationDays,
  description,
  features = [],
  highlighted = false,
  children,
  className,
}: PlanCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-card p-6',
        highlighted ? 'bg-secondary text-text' : 'bg-surface',
        className,
      )}
    >
      <h3 className="font-display text-title">{name}</h3>
      <p className="font-display text-metric text-primary">{formatPrice(priceCents)}</p>
      <p className="text-small text-text-muted">Cada {durationDays} días</p>
      {description ? <p className="text-body text-text-soft">{description}</p> : null}
      {features.length > 0 ? (
        <ul className="flex flex-col gap-1 text-body text-text-soft">
          {features.map((feature) => (
            <li key={feature}>· {feature}</li>
          ))}
        </ul>
      ) : null}
      {children ? <div className="mt-auto pt-3">{children}</div> : null}
    </article>
  )
}
