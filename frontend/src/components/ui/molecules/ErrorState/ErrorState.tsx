import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type ErrorStateProps = {
  /** Icon shown in a danger circle. */
  icon?: IconName
  title: string
  /** Message under the title. */
  message?: string
  /** Action node: a retry Button in lists, or a "go back home" link in 403/404. */
  action?: ReactNode
  className?: string
}

export function ErrorState({
  icon = 'alert-triangle',
  title,
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-8 text-center', className)}>
      <span className="flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="font-display text-title text-text">{title}</h3>
      {message ? <p className="max-w-prose text-body text-text-muted">{message}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
