import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName, type IconSize } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type IconButtonVariant = 'surface' | 'primary' | 'ghost'
export type IconButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT: Record<IconButtonVariant, string> = {
  surface: 'bg-surface text-text-soft shadow-md hover:bg-line',
  primary: 'bg-primary text-ink hover:bg-primary/90',
  ghost: 'text-text-soft hover:bg-white/10',
}

// Mobile first: 44px / 48px touch targets (Figma). From `md` they are one step smaller.
const SIZE: Record<IconButtonSize, { box: string; icon: IconSize }> = {
  sm: { box: 'size-8', icon: 16 },
  md: { box: 'size-11 md:size-10', icon: 20 },
  lg: { box: 'size-12 md:size-11', icon: 20 },
}

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> & {
  icon: IconName
  /** Accessible name. Required because the button has no visible text. */
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
}

export function IconButton({
  icon,
  label,
  variant = 'surface',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const { box, icon: iconSize } = SIZE[size]
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(BASE, VARIANT[variant], box, className)}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}
