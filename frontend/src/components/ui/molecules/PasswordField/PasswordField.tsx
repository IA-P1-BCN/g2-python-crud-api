import { useId, useState } from 'react'
import { Icon } from '@/components/ui/atoms/Icon'
import { IconButton } from '@/components/ui/atoms/IconButton'
import { Input } from '@/components/ui/atoms/Input'
import { cn } from '@/lib/cn'
import { passwordChecks } from '@/lib/password'

export type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  name?: string
  autoComplete?: string
  required?: boolean
  /** Hint shown before the user types. */
  placeholder?: string
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
  placeholder,
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

      <Input
        id={inputId}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        value={value}
        invalid={Boolean(error)}
        leftIcon="lock"
        onChange={(event) => onChange(event.target.value)}
        rightSlot={
          <IconButton
            icon={visible ? 'eye-off' : 'eye'}
            label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            variant="ghost"
            size="sm"
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          />
        }
      />

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
