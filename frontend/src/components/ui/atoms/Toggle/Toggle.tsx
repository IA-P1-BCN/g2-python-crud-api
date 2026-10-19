import { cn } from '@/lib/cn'

export type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name of the switch. */
  label: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors',
        checked ? 'justify-end bg-primary' : 'justify-start bg-line',
        disabled && 'opacity-50',
        className,
      )}
    >
      <span className="size-5 rounded-full bg-white" />
    </button>
  )
}
