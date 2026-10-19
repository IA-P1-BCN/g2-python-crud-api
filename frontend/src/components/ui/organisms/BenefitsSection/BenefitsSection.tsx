import { FeatureItem, type FeatureItemProps } from '@/components/ui/molecules/FeatureItem'
import { cn } from '@/lib/cn'

export type BenefitsSectionProps = {
  items: FeatureItemProps[]
  className?: string
}

export function BenefitsSection({ items, className }: BenefitsSectionProps) {
  return (
    <section className={cn('grid gap-4 sm:grid-cols-3', className)} aria-label="Ventajas">
      {items.map((item) => (
        <FeatureItem key={item.title} {...item} />
      ))}
    </section>
  )
}
