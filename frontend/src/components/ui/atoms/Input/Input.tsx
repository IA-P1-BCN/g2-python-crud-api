import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Icon shown inside the field, on the left. */
  leftIcon?: IconName
  /** Content on the right, for example an `IconButton` to reveal a password. */
  rightSlot?: ReactNode
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightSlot, invalid = false, className, ...rest },
  ref,
) {
  return (
    // `className` goes on the wrapper so it controls layout (width, margins).
    <div className={cn('relative flex items-center', className)}>
      {leftIcon ? (
        <Icon
          name={leftIcon}
          size={20}
          className="pointer-events-none absolute left-4 text-text-muted"
        />
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded-full border bg-surface-sunken py-3 font-sans text-body text-text outline-none transition-colors placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50',
          leftIcon ? 'pl-11' : 'pl-4',
          rightSlot ? 'pr-12' : 'pr-4',
          invalid
            ? 'border-danger focus-visible:ring-2 focus-visible:ring-danger/30'
            : 'border-white/10 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
        )}
        {...rest}
      />
      {rightSlot ? <div className="absolute right-2 flex items-center">{rightSlot}</div> : null}
    </div>
  )
})
