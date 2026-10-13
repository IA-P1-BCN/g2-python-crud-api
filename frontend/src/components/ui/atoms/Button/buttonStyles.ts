import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'white' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-display font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT: Record<ButtonVariant, string> = {
  // Main call to action (lime).
  primary: 'bg-primary text-ink font-bold tracking-tight shadow-glow-primary hover:bg-primary/90',
  // Outlined button on dark surfaces.
  secondary: 'border border-white/10 bg-surface-sunken text-text hover:bg-surface',
  // Translucent button on top of blue feature cards.
  tertiary: 'bg-scrim text-white/90 hover:bg-black/40',
  // White button on top of blue feature cards.
  white: 'bg-white text-ink font-bold tracking-tight hover:bg-text-soft',
  danger: 'border border-danger/40 text-danger hover:bg-danger-soft',
  // Text-only button for low-emphasis actions.
  ghost: 'text-text-soft hover:bg-white/10',
}

// Mobile first (Figma, 390px). From `md` (768px) the controls are one step smaller.
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-small md:h-9',
  md: 'h-11 px-5 text-body md:h-10',
  lg: 'h-13 px-5 text-body md:h-12',
}

type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

/** Classes of a button, so links (`<Link>`) can look exactly like a `<Button>`. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) {
  return cn(BASE, VARIANT[variant], SIZE[size], fullWidth && 'w-full', className)
}
