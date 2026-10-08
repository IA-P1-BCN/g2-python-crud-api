import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button } from '@/components/ui'
import { toApiError, usersApi } from '@/api'
import type { User } from '@/types/api'

const MIN_PASSWORD_LENGTH = 8

type MemberFormProps = {
  /** Member to edit; without it the form creates a new member. */
  member?: User
  onDone: () => void
}

export function MemberForm({ member, onDone }: MemberFormProps) {
  const queryClient = useQueryClient()
  const isEdit = member !== undefined
  const [fullName, setFullName] = useState(member?.full_name ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () =>
      isEdit
        ? usersApi.update(member.id, { full_name: fullName, email })
        : usersApi.create({
            full_name: fullName,
            email,
            password,
            role: 'member',
            is_active: true,
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      onDone()
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isEdit && password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      return
    }
    setFormError(null)
    save.mutate()
  }

  return (
    <form
      className="form card"
      onSubmit={handleSubmit}
      aria-label={isEdit ? 'Editar socio' : 'Nuevo socio'}
    >
      <h2 className="card__title">{isEdit ? 'Editar socio' : 'Nuevo socio'}</h2>

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {save.isError ? <Alert variant="error">{toApiError(save.error).message}</Alert> : null}

      <label className="field">
        Nombre completo
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>
      <label className="field">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      {isEdit ? null : (
        <label className="field">
          Contraseña inicial
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
      )}

      <div className="form__actions">
        <Button type="submit" isLoading={save.isPending}>
          {isEdit ? 'Guardar cambios' : 'Dar de alta'}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
