import { Avatar } from '@/components/ui/atoms/Avatar'
import { cn } from '@/lib/cn'

export type AvatarStackPerson = {
  id: number
  name: string
  src?: string
}

export type AvatarStackProps = {
  people: AvatarStackPerson[]
  /** Avatars shown before the +N counter. */
  max?: number
  className?: string
}

const DEFAULT_MAX = 3

export function AvatarStack({ people, max = DEFAULT_MAX, className }: AvatarStackProps) {
  const shown = people.slice(0, max)
  const hidden = people.length - shown.length

  return (
    <div className={cn('flex items-center', className)} aria-label={`${people.length} personas`}>
      {shown.map((person) => (
        <span
          key={person.id}
          aria-hidden="true"
          className="-ml-2 inline-flex rounded-full ring-2 ring-surface first:ml-0"
        >
          <Avatar name={person.name} src={person.src} size="sm" />
        </span>
      ))}
      {hidden > 0 ? (
        <span
          aria-hidden="true"
          className="-ml-2 inline-flex size-8 items-center justify-center rounded-full bg-surface-sunken text-caption text-text-muted ring-2 ring-surface"
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  )
}
