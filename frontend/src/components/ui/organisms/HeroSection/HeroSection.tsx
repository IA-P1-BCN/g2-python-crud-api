import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type HeroSectionProps = {
  title: string
  subtitle: string
  /** CTA buttons. */
  actions: ReactNode
  className?: string
}

export function HeroSection({ title, subtitle, actions, className }: HeroSectionProps) {
  return (
    <section
      className={cn('flex flex-col items-center gap-4 py-10 text-center', className)}
      aria-label="Presentación"
    >
      <h1 className="font-display text-display text-text sm:text-hero">{title}</h1>
      <p className="max-w-prose text-lead text-text-muted">{subtitle}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </section>
  )
}
