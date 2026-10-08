import type { ReactNode } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
}

export function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {title ? <strong className="alert__title">{title}</strong> : null}
      {children ? <span className="alert__body">{children}</span> : null}
    </div>
  )
}
