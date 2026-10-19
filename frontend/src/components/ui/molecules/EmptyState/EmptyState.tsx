import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type EmptyStateProps = {
  /** Optional icon shown in a muted circle. */
  icon?: IconName
  title: string
  /** Supporting hint under the title. */
  hint?: string
  /** Optional action, e.g. a Button to create the first item. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-8 text-center', className)}>
      {icon ? (
        <span className="flex size-16 items-center justify-center rounded-full bg-surface-sunken text-text-muted">
          <Icon name={icon} size={24} />
        </span>
      ) : null}
      <h3 className="font-display text-title text-text">{title}</h3>
      {hint ? <p className="max-w-prose text-body text-text-muted">{hint}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
