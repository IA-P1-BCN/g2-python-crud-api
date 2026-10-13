import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type LogoProps = {
  /** Product name shown next to the mark. */
  name?: string
  /** Optional role subtitle, e.g. "Administrador". */
  subtitle?: string | null
  className?: string
}

export function Logo({ name = 'Athletica', subtitle = null, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-ink">
        <Icon name="dumbbell" size={20} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-title text-text">{name}</span>
        {subtitle ? <span className="text-caption text-text-muted">{subtitle}</span> : null}
      </span>
    </span>
  )
}
