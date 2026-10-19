import { useState } from 'react'
import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'
import { getInitials } from './getInitials'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarStatus = 'verified' | 'online'

const SIZE: Record<AvatarSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-small',
  lg: 'size-14 text-lead',
}

export type AvatarProps = {
  /** Photo. Without it (or if it fails to load) the initials are shown. */
  src?: string
  name: string
  size?: AvatarSize
  /** `verified`: lime check. `online`: green dot. */
  status?: AvatarStatus
  className?: string
}

export function Avatar({ src, name, size = 'md', status, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full bg-surface font-display font-bold text-text-soft',
          SIZE[size],
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span role="img" aria-label={name}>
            {getInitials(name)}
          </span>
        )}
      </span>
      {status === 'verified' ? (
        <span
          data-testid="avatar-status"
          className="absolute -right-0.5 -bottom-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary ring-2 ring-ink"
        >
          <Icon name="check" size={16} className="size-2.5 text-ink" />
        </span>
      ) : null}
      {status === 'online' ? (
        <span
          data-testid="avatar-status"
          className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-ink"
        />
      ) : null}
    </span>
  )
}
