import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/ui/atoms/Button'
import { Alert } from '@/ui/molecules/Alert'
import { homePathForRole, useAuth } from '@/auth'

export function RegisterPage() {
  const { register, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

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
