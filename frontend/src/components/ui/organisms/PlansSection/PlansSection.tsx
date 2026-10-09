import type { ReactNode } from 'react'
import { Alert } from '@/components/ui/molecules/Alert'
import { PlanCard } from '@/components/ui/molecules/PlanCard'
import { cn } from '@/lib/cn'

export type PlanSummary = {
  id: number
  name: string
  priceCents: number
  durationDays: number
  description: string | null
}

export type PlansSectionProps = {
  plans: PlanSummary[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  /** Action rendered inside each plan card. */
  renderAction?: (plan: PlanSummary) => ReactNode
  title?: string
  className?: string
}

export function PlansSection({
  plans,
  isLoading = false,
  error = null,
  emptyMessage = 'No hay planes disponibles por el momento.',
  renderAction,
  title = 'Planes',
  className,
}: PlansSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Planes">
      <h2 className="font-display text-headline text-text">{title}</h2>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {!error && isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!error && !isLoading && plans.length === 0 ? (
        <p className="text-body text-text-muted">{emptyMessage}</p>
      ) : null}

      {!error && !isLoading && plans.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              priceCents={plan.priceCents}
              durationDays={plan.durationDays}
              description={plan.description}
            >
              {renderAction ? renderAction(plan) : null}
            </PlanCard>
          ))}
        </div>
      ) : null}
    </section>
  )
}
