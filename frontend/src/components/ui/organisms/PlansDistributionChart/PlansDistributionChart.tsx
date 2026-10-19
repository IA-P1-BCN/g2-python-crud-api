import { ChartCard } from '@/components/ui/molecules/ChartCard'
import { formatPercent } from '@/lib/format'
import type { PlanShare } from '@/types/api'

export type PlansDistributionChartProps = {
  plans: PlanShare[]
  className?: string
}

const RADIUS = 40
const STROKE = 12
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE_COLORS = ['stroke-chart-1', 'stroke-chart-2', 'stroke-chart-3', 'stroke-chart-4']
const DOT_COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4']

/** Donut with a legend: how the active memberships are shared between plans. */
export function PlansDistributionChart({ plans, className }: PlansDistributionChartProps) {
  const total = plans.reduce((sum, plan) => sum + plan.members, 0)
  let consumed = 0
  const segments = plans.map((plan, index) => {
    const length = total > 0 ? (plan.members / total) * CIRCUMFERENCE : 0
    const segment = { plan, index, length, offset: consumed }
    consumed += length
    return segment
  })

  return (
    <ChartCard title="Planes más contratados" className={className}>
      {plans.length === 0 ? (
        <p className="text-body text-text-muted">No hay membresías en vigor.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Reparto de ${total} membresías`}
            className="size-32 -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-line"
            />
            {segments.map(({ plan, index, length, offset }) => (
              <circle
                key={plan.plan_id}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                className={STROKE_COLORS[index % STROKE_COLORS.length]}
              />
            ))}
          </svg>

          <ul className="flex min-w-0 flex-1 flex-col gap-2">
            {plans.map((plan, index) => (
              <li key={plan.plan_id} className="flex items-center gap-2 text-small">
                <span
                  aria-hidden="true"
                  className={`size-3 shrink-0 rounded-full ${DOT_COLORS[index % DOT_COLORS.length]}`}
                />
                <span className="min-w-0 flex-1 truncate text-text">{plan.name}</span>
                <span className="text-text-muted">
                  {plan.members} · {formatPercent(plan.share)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  )
}
