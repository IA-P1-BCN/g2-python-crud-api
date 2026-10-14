import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import { homePathForRole, useAuth } from '@/auth'

type LocationState = {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const user = await login({ email, password })
      const state = location.state as LocationState | null
      const destination = state?.from?.pathname ?? homePathForRole(user.role)
      navigate(destination, { replace: true })
    } catch {
      // El error ya se muestra desde AuthContext.
    }
  }

  return (
    <form className="login__card" onSubmit={handleSubmit} aria-label="Iniciar sesión">
      <h1>Acceso al gimnasio</h1>

      {error ? <Alert variant="error">{error}</Alert> : null}

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
        onChange={setPassword}
        autoComplete="current-password"
        required
      />

      <Button type="submit" isLoading={isLoading}>
        Entrar
      </Button>

      <p className="login__footer">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </form>
  )
}
