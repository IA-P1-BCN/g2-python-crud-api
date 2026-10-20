import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Skeleton } from '@/components/ui/atoms/Skeleton'
import { EmptyState } from '@/components/ui/molecules/EmptyState'
import { PlanCard } from '@/components/ui/molecules/PlanCard'
import { cn } from '@/lib/cn'
import type { MembershipPlan } from '@/types/api'

const SKELETON_COUNT = 3

export type PlansAdminListProps = {
  plans: MembershipPlan[]
  /** True on the first load, before any data arrives. */
  isLoading?: boolean
  onEdit: (plan: MembershipPlan) => void
  onToggle: (plan: MembershipPlan) => void
  onRemove: (plan: MembershipPlan) => void
  className?: string
}

/** Admin plan list: one `PlanCard` per plan with its status and the table's actions. */
export function PlansAdminList({
  plans,
  isLoading = false,
  onEdit,
  onToggle,
  onRemove,
  className,
}: PlansAdminListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-small text-text-muted">Cargando…</p>
        <ul className={cn('flex flex-col gap-4', className)} aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li key={index}>
              <div className="flex flex-col gap-3 rounded-card bg-surface p-6">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (plans.length === 0) {
    return <EmptyState title="Todavía no hay planes." className={className} />
  }

  return (
    <ul className={cn('flex flex-col gap-4', className)}>
      {plans.map((plan) => (
        <li key={plan.id}>
          <PlanCard
            name={plan.name}
            priceCents={plan.price_cents}
            durationDays={plan.duration_days}
            description={plan.description}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone={plan.is_active ? 'success' : 'neutral'}>
                {plan.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEdit(plan)}>
                  Editar
                </Button>
                <Button
                  variant={plan.is_active ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={() => onToggle(plan)}
                >
                  {plan.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button variant="danger" size="sm" onClick={() => onRemove(plan)}>
                  Borrar
                </Button>
              </div>
            </div>
          </PlanCard>
        </li>
      ))}
    </ul>
  )
}
