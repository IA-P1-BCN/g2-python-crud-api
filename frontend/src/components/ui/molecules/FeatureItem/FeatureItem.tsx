import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type FeatureItemProps = {
  icon: IconName
  title: string
  text: string
  className?: string
}

export function FeatureItem({ icon, title, text, className }: FeatureItemProps) {
  return (
    <article className={cn('flex flex-col gap-3 rounded-tile bg-surface p-4', className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="font-display text-title text-text">{title}</h3>
      <p className="text-body text-text-muted">{text}</p>
    </article>
  )
}
