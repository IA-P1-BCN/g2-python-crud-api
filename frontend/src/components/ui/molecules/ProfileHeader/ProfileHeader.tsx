import { Avatar } from '@/components/ui/atoms/Avatar'
import { Badge } from '@/components/ui/atoms/Badge'
import { cn } from '@/lib/cn'
import { ROLE_LABELS } from '@/lib/roles'
import type { Role } from '@/types/api'

export type ProfileHeaderProps = {
  name: string
  role: Role
  /** Avatar photo; without it the initials are shown. */
  avatarSrc?: string
  className?: string
}

export function ProfileHeader({ name, role, avatarSrc, className }: ProfileHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar name={name} src={avatarSrc} size="lg" />
      <div className="flex flex-col items-start gap-1">
        <h1 className="font-display text-headline text-text">{name}</h1>
        <Badge tone="info">{ROLE_LABELS[role]}</Badge>
      </div>
    </div>
  )
}
