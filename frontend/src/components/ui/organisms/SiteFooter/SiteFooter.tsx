import { cn } from '@/lib/cn'

export type SiteFooterProps = {
  /** Copyright year. Defaults to the current one. */
  year?: number
  className?: string
}

export function SiteFooter({ year = new Date().getFullYear(), className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'px-4 py-6 text-center text-caption uppercase tracking-wide text-text-muted',
        className,
      )}
    >
      © {year} Athletica. Todos los derechos reservados.
    </footer>
  )
}
