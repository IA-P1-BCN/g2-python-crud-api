import { cn } from '@/lib/cn'

export type SkeletonProps = {
  /** Size and shape utilities, e.g. "h-8 w-40 rounded-full". */
  className?: string
}

/** Placeholder block shown while content is loading. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('h-4 w-full animate-pulse rounded-tile bg-surface-sunken', className)}
    />
  )
}
