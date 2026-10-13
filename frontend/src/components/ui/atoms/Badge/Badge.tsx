import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone =
  'neutral' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-line text-text-soft',
  primary: 'bg-primary-soft text-primary',
  // For use on top of blue feature cards.
  secondary: 'bg-secondary-mid text-white',
  info: 'bg-secondary/20 text-secondary-soft',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger-soft text-danger',
}

export type BadgeProps = {
  tone?: BadgeTone
  /** Small status dot before the text. */
  dot?: boolean
  /** Uppercase text with wider tracking (labels such as a plan name). */
  uppercase?: boolean
  className?: string
  children: ReactNode
}

export function Badge({
  tone = 'neutral',
  dot = false,
  uppercase = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-caption font-bold whitespace-nowrap',
        uppercase && 'tracking-wide uppercase',
        TONE[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="size-2 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}
