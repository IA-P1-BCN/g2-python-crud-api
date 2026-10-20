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
      <img src="/athletica_logo.svg" alt="" className="size-8" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-title text-text">{name}</span>
        {subtitle ? <span className="text-caption text-text-muted">{subtitle}</span> : null}
      </span>
    </span>
  )
}
