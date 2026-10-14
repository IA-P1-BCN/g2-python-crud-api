import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
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
  const [dismissed, setDismissed] = useState<string | null>(null)

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
    <form
      className="flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6"
      onSubmit={handleSubmit}
      aria-label="Iniciar sesión"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-headline text-text">Iniciar sesión</h1>
        <p className="text-small text-text-muted">
          Ingresa tus credenciales para acceder a tu cuenta deportiva.
        </p>
      </div>

      {error && dismissed !== error ? (
        <Alert variant="error" title="Acceso denegado" onClose={() => setDismissed(error)}>
          {error}
        </Alert>
      ) : null}

      <label className="flex flex-col gap-1">
        <span className="text-small text-text-muted">Correo electrónico</span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          leftIcon="mail"
          placeholder="marcos.valle@performance.com"
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
        placeholder="secretPassword123"
      />

      <Button type="submit" isLoading={isLoading} fullWidth rightIcon="arrow-right">
        Iniciar sesión
      </Button>

      <p className="text-center text-small text-text-muted">
        ¿No tienes cuenta aún?{' '}
        <Link to="/register" className="font-semibold text-primary">
          Registrarse
        </Link>
      </p>
    </form>
  )
}
