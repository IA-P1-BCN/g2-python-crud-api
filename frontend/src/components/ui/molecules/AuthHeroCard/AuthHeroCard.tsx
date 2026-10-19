import { Badge } from '@/components/ui/atoms/Badge'
import { cn } from '@/lib/cn'

export type AuthHeroCardProps = {
  /** Slogan. */
  title: string
  subtitle: string
  /** Optional small label above the slogan. */
  badge?: string
  className?: string
}

/** Blue card with the auth slogan and subtitle. */
export function AuthHeroCard({ title, subtitle, badge, className }: AuthHeroCardProps) {
  return (
    <section
      aria-label={title}
      className={cn('flex flex-col gap-2 rounded-card bg-secondary p-6 text-white', className)}
    >
      {badge ? (
        <Badge tone="secondary" className="self-start">
          {badge}
        </Badge>
      ) : null}
      <h2 className="font-display text-headline">{title}</h2>
      <p className="text-body text-white/90">{subtitle}</p>
    </section>
  )
}
