import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import { homePathForRole, useAuth } from '@/auth'
import { passwordErrorMessage } from '@/lib/password'

export function RegisterPage() {
  const { register, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const invalidPassword = passwordErrorMessage(password)
    if (invalidPassword) {
      setPasswordError(invalidPassword)
      return
    }
    setPasswordError(null)

    try {
      const user = await register({ full_name: fullName, email, password })
      navigate(homePathForRole(user.role), { replace: true })
    } catch {
      // The error is already shown by AuthContext.
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit} aria-label="Crear cuenta">
        <h1>Crear cuenta de socio</h1>

        {error ? <Alert variant="error">{error}</Alert> : null}

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

        <PasswordField
          label="Contraseña"
          name="password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            if (passwordError) setPasswordError(null)
          }}
          autoComplete="new-password"
          required
          showRules
          error={passwordError}
        />

        <Button type="submit" isLoading={isLoading}>
          Registrarme
        </Button>

        <p className="login__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}
