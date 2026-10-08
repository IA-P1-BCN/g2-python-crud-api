import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button } from '@/components/ui'
import { toApiError, usersApi } from '@/api'
import type { Role, User } from '@/types/api'
import { ROLE_LABELS } from './roleLabels'

const MIN_PASSWORD_LENGTH = 8

type UserFormProps = {
  /** User to edit; without it the form creates a new one. */
  user?: User
  /** Roles the form can assign; with only one, no role selector is shown. */
  roles: Role[]
  /** Word used in the title: "Nuevo socio", "Editar usuario"... */
  noun: string
  onDone: () => void
}

export function UserForm({ user, roles, noun, onDone }: UserFormProps) {
  const queryClient = useQueryClient()
  const isEdit = user !== undefined
  const canChooseRole = roles.length > 1
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<Role>(user?.role ?? roles[0])
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () =>
      isEdit
        ? usersApi.update(user.id, {
            full_name: fullName,
            email,
            ...(canChooseRole ? { role } : {}),
          })
        : usersApi.create({ full_name: fullName, email, password, role, is_active: true }),
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

  const title = `${isEdit ? 'Editar' : 'Nuevo'} ${noun}`

  return (
    <form className="form card" onSubmit={handleSubmit} aria-label={title}>
      <h2 className="card__title">{title}</h2>

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
      {canChooseRole ? (
        <label className="field">
          Rol
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {roles.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
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
