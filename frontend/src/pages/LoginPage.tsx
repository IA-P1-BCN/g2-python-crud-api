import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { AuthHeroCard } from '@/components/ui/molecules/AuthHeroCard'
import { FormField } from '@/components/ui/molecules/FormField'
import { Alert } from '@/components/ui/molecules/Alert'
import { Button } from '@/components/ui/atoms/Button'
import { LoginForm, type LoginCredentials } from '@/components/ui/organisms/LoginForm'
import { homePathForRole, useAuth } from '@/auth'
import { toApiError } from '@/api'
import { AUTH_HERO_SUBTITLE, AUTH_HERO_TITLE } from '@/lib/auth-copy'

type LocationState = {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [pendingCredentials, setPendingCredentials] = useState<LoginCredentials | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [totpError, setTotpError] = useState<string | null>(null)

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(credentials: LoginCredentials) {
    setPendingCredentials(null)
    setTotpCode('')
    try {
      const loggedInUser = await login(credentials)
      const state = location.state as LocationState | null
      const destination = state?.from?.pathname ?? homePathForRole(loggedInUser.role)
      navigate(destination, { replace: true })
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.code === 'totp_required') {
        setPendingCredentials(credentials)
        setTotpError(apiError.message)
      } else {
        setTotpError(null)
      }
    }
  }

  async function handleTotpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pendingCredentials) return
    try {
      const loggedInUser = await login({
        ...pendingCredentials,
        totp_code: totpCode.trim(),
      })
      const state = location.state as LocationState | null
      const destination = state?.from?.pathname ?? homePathForRole(loggedInUser.role)
      navigate(destination, { replace: true })
    } catch (err) {
      if (toApiError(err).code !== 'totp_required') {
        setPendingCredentials(null)
        setTotpCode('')
        setTotpError(null)
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <AuthHeroCard title={AUTH_HERO_TITLE} subtitle={AUTH_HERO_SUBTITLE} />

      {pendingCredentials ? (
        <form
          className="flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6"
          onSubmit={handleTotpSubmit}
          aria-label="Código de verificación"
        >
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-headline text-text">Verificación en dos pasos</h1>
            <p className="text-small text-text-muted">
              Introduce el código de 6 cifras de tu aplicación de autenticación.
            </p>
          </div>

          {totpError ? (
            <Alert variant="error" title="Acceso denegado">
              {totpError}
            </Alert>
          ) : null}

          <FormField
            label="Código de 6 cifras"
            type="text"
            name="totp_code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="123456"
            value={totpCode}
            onChange={(event) => setTotpCode(event.target.value)}
          />

          <Button type="submit" isLoading={isLoading} fullWidth rightIcon="arrow-right">
            Verificar
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => {
              setPendingCredentials(null)
              setTotpCode('')
            }}
          >
            Volver
          </Button>
        </form>
      ) : (
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading && !pendingCredentials}
          error={error}
        />
      )}
    </div>
  )
}
