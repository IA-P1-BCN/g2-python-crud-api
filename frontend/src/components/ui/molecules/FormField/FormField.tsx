import { forwardRef, useId, type ReactNode } from 'react'
import { Input, type InputProps } from '@/components/ui/atoms/Input'
import { cn } from '@/lib/cn'

export type FormFieldProps = Omit<InputProps, 'id' | 'invalid' | 'className'> & {
  /** Visible label for the field. */
  label: ReactNode
  /** Helper text shown under the input. */
  helperText?: ReactNode
  /** Error message; when set, the field is marked invalid and overrides the helper. */
  error?: string
  /** Explicit id for the input. Generated when omitted. */
  id?: string
  className?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, helperText, error, className, id, ...inputProps },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`
  const message = error ?? helperText
  const invalid = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="text-small text-text-muted">
        {label}
      </label>

      <Input
        {...inputProps}
        ref={ref}
        id={inputId}
        invalid={invalid}
        aria-describedby={message ? messageId : undefined}
      />

      {message ? (
        <p id={messageId} className={cn('text-small', error ? 'text-danger' : 'text-text-muted')}>
          {message}
        </p>
      ) : null}
    </div>
  )
})
