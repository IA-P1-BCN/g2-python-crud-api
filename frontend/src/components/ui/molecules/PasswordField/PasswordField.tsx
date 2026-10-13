import { useId, useState } from 'react'
import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'
import { passwordChecks } from '@/lib/password'

export type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  name?: string
  autoComplete?: string
  required?: boolean
  /** Show the strength checklist while typing. */
  showRules?: boolean
  /** Error to show below the field. */
  error?: string | null
  className?: string
}

export function PasswordField({
  label,
  value,
  onChange,
  name,
  autoComplete,
  required = false,
  showRules = false,
  error = null,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = useId()

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="text-small text-text-muted">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-full border border-line bg-surface-sunken py-2 pl-4 pr-11 text-body text-text outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={20} />
        </button>
      </div>

      {showRules ? (
        <ul className="flex flex-col gap-0.5">
          {passwordChecks(value).map((check) => (
            <li
              key={check.id}
              className={cn(
                'flex items-center gap-1 text-caption',
                check.met ? 'text-success' : 'text-text-muted',
              )}
            >
              <Icon name={check.met ? 'check' : 'x'} size={16} />
              {check.label}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-caption text-danger">{error}</p> : null}
    </div>
  )
}
