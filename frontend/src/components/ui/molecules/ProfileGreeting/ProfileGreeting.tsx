import { Avatar } from '@/components/ui/atoms/Avatar'
import { cn } from '@/lib/cn'

export type ProfileGreetingProps = {
  name: string
  /** Line under the greeting: the plan name or a date. */
  subtitle?: string | null
  /** Avatar photo; without it the initials are shown. */
  src?: string
  greeting?: string
  className?: string
}

export function ProfileGreeting({
  name,
  subtitle = null,
  src,
  greeting = 'Hola',
  className,
}: ProfileGreetingProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar name={name} src={src} size="md" />
      <div className="flex flex-col">
        <h1 className="font-display text-title text-text">
          {greeting}, {name}
        </h1>
        {subtitle ? <p className="text-small text-text-muted">{subtitle}</p> : null}
      </div>
    </div>
  )
}
