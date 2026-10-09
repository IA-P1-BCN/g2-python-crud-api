import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type LandingFooterProps = {
  title?: string
  text?: string
  /** Final call-to-action buttons. */
  actions: ReactNode
  className?: string
}

export function LandingFooter({
  title = '¿Listo para empezar?',
  text = 'Únete y reserva tu primera clase hoy mismo.',
  actions,
  className,
}: LandingFooterProps) {
  return (
    <footer
      className={cn(
        'flex flex-col items-center gap-4 rounded-card bg-surface p-8 text-center',
        className,
      )}
    >
      <h2 className="font-display text-headline text-text">{title}</h2>
      <p className="text-body text-text-muted">{text}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
      <p className="text-caption text-text-muted">Gym · Entrena a tu ritmo</p>
    </footer>
  )
}
