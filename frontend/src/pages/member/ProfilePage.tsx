import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { toApiError, usersApi } from '@/api'
import { useAuth } from '@/auth'

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null)

  const updateProfile = useMutation({
    mutationFn: () =>
      usersApi.updateProfile(user!.id, {
        full_name: fullName,
        email,
      }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
    },
  })

  const changePassword = useMutation({
    mutationFn: () =>
      usersApi.changePassword(user!.id, {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
      setPasswordValidationError(null)
    },
  })

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateProfile.mutate()
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordValidationError(null)

    if (newPassword.length < 8) {
      setPasswordValidationError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (newPassword !== repeatPassword) {
      setPasswordValidationError('Las contraseñas no coinciden')
      return
    }

    changePassword.mutate()
  }

  if (!user) return null

  return (
    <div className="page">
      <div className="page__header">
        <h1>Mi perfil</h1>
      </div>

      <div className="card">
        <h2>Mis datos</h2>

        {updateProfile.isError ? (
          <Alert variant="error">{toApiError(updateProfile.error).message}</Alert>
        ) : null}

        {updateProfile.isSuccess ? <Alert variant="success">Perfil actualizado</Alert> : null}

        <form onSubmit={handleProfileSubmit}>
          <label className="field">
            <span>Nombre completo</span>
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <Button type="submit" isLoading={updateProfile.isPending}>
            Guardar
          </Button>
        </form>
      </div>

      <div className="card">
        <h2>Cambiar contraseña</h2>

        {passwordValidationError ? <Alert variant="error">{passwordValidationError}</Alert> : null}

        {changePassword.isError ? (
          <Alert variant="error">{toApiError(changePassword.error).message}</Alert>
        ) : null}

        {changePassword.isSuccess ? <Alert variant="success">Contraseña actualizada</Alert> : null}

        <form onSubmit={handlePasswordSubmit}>
          <label className="field">
            <span>Contraseña actual</span>
            <input
              type="password"
              name="current_password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Nueva contraseña</span>
            <input
              type="password"
              name="new_password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Repetir nueva contraseña</span>
            <input
              type="password"
              name="repeat_password"
              autoComplete="new-password"
              required
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
            />
          </label>

          <Button type="submit" isLoading={changePassword.isPending}>
            Cambiar contraseña
          </Button>
        </form>
      </div>

      <div className="card">
        <Button type="button" variant="danger" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
