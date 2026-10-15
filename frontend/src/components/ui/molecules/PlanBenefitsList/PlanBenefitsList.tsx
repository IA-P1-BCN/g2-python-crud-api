import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'
import { PLAN_BENEFITS, type PlanBenefit } from '@/lib/plan-benefits'

export type PlanBenefitsListProps = {
  /** Benefits to list. Defaults to the shared gym plan benefits. */
  items?: PlanBenefit[]
  title?: string
  className?: string
}

/** List of what the plan includes, one icon per benefit. */
export function PlanBenefitsList({
  items = PLAN_BENEFITS,
  title = 'Incluye',
  className,
}: PlanBenefitsListProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)} aria-label={title}>
      <h3 className="font-display text-title text-text">{title}</h3>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-body text-text-soft">
            <Icon name={item.icon} size={16} className="shrink-0 text-primary" />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
