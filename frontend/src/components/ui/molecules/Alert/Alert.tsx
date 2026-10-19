import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { IconButton } from '@/components/ui/atoms/IconButton'
import { cn } from '@/lib/cn'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const VARIANT: Record<AlertVariant, { box: string; icon: IconName }> = {
  info: { box: 'border-secondary bg-surface-sunken text-text-soft', icon: 'info' },
  success: { box: 'border-success bg-surface-sunken text-success', icon: 'check' },
  warning: { box: 'border-warning bg-surface-sunken text-warning', icon: 'alert-triangle' },
  error: { box: 'border-danger bg-danger-surface text-danger', icon: 'alert-triangle' },
}

export type AlertProps = {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  /** Shows a close button that hides the alert. */
  onClose?: () => void
  className?: string
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { box, icon } = VARIANT[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-tile border px-4 py-3', box, className)}
    >
      <Icon name={icon} size={20} className="mt-0.5 shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? <strong className="font-display text-body">{title}</strong> : null}
        {children ? <span className="text-small text-text-muted">{children}</span> : null}
      </div>

      {onClose ? (
        <IconButton icon="x" label="Cerrar aviso" variant="ghost" size="sm" onClick={onClose} />
      ) : null}
    </div>
  )
}
