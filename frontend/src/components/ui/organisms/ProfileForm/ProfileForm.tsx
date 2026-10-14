import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { cn } from '@/lib/cn'

export type ProfileFormValues = {
  full_name: string
  email: string
}

export type ProfileFormProps = {
  defaultName: string
  defaultEmail: string
  onSave: (values: ProfileFormValues) => void
  isSaving?: boolean
  error?: string | null
  message?: string | null
  className?: string
}

export function ProfileForm({
  defaultName,
  defaultEmail,
  onSave,
  isSaving = false,
  error = null,
  message = null,
  className,
}: ProfileFormProps) {
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ full_name: name.trim(), email: email.trim() })
  }

  return (
    <form
      className={cn('flex flex-col gap-3', className)}
      aria-label="Mis datos"
      onSubmit={handleSubmit}
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <label className="flex flex-col gap-1 text-small text-text-muted">
        Nombre completo
        <Input
          name="full_name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-small text-text-muted">
        Email
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <Button type="submit" isLoading={isSaving}>
        Guardar
      </Button>
    </form>
  )
}
