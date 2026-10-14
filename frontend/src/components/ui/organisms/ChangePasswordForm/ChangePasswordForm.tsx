import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import { cn } from '@/lib/cn'
import { passwordErrorMessage } from '@/lib/password'

export type ChangePasswordValues = {
  current_password: string
  new_password: string
}

export type ChangePasswordFormProps = {
  onSubmit: (values: ChangePasswordValues) => void
  isSaving?: boolean
  error?: string | null
  message?: string | null
  className?: string
}

export function ChangePasswordForm({
  onSubmit,
  isSaving = false,
  error = null,
  message = null,
  className,
}: ChangePasswordFormProps) {
  const [current, setCurrent] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const invalid = passwordErrorMessage(newPassword)
    if (invalid) {
      setValidationError(invalid)
      return
    }
    if (newPassword !== confirm) {
      setValidationError('Las contraseñas no coinciden')
      return
    }
    setValidationError(null)
    onSubmit({ current_password: current, new_password: newPassword })
  }

  return (
    <form
      className={cn('flex flex-col gap-3', className)}
      aria-label="Cambiar contraseña"
      onSubmit={handleSubmit}
    >
      {validationError ? <Alert variant="error">{validationError}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <PasswordField
        label="Contraseña actual"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
        required
      />
      <PasswordField
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        required
        showRules
      />
      <PasswordField
        label="Repetir nueva contraseña"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        required
      />

      <Button type="submit" isLoading={isSaving}>
        Cambiar contraseña
      </Button>
    </form>
  )
}
