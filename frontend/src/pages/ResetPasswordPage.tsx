import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi, toApiError } from '@/api'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { AuthHeroCard } from '@/components/ui/molecules/AuthHeroCard'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import {
  AUTH_HERO_SUBTITLE,
  AUTH_HERO_TITLE,
  AUTH_LINK_CLASS,
  INVALID_LINK_MESSAGE,
} from '@/lib/auth-copy'

/** Public page that sets a new password with the token of the recovery link. */
export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ruleError, setRuleError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsLoading(true)
    setError(null)
    setRuleError(null)
    try {
      await authApi.resetPassword({ token, new_password: password })
      setDone(true)
    } catch (err) {
      const apiError = toApiError(err)
      // 422 is the password rule: show it under the field, next to the checklist.
      if (apiError.status === 422) {
        setRuleError(apiError.message)
      } else {
        setError(apiError.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-card border border-line bg-surface p-6 text-center">
        <h1 className="font-display text-headline text-text">Restablecer contraseña</h1>

        <Alert variant="error">{INVALID_LINK_MESSAGE}</Alert>

        <Link to="/login" className={AUTH_LINK_CLASS}>
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-card border border-line bg-surface p-6 text-center">
        <h1 className="font-display text-headline text-text">Contraseña cambiada</h1>

        <Alert variant="success">Ya puedes iniciar sesión con tu contraseña nueva.</Alert>

        <Link to="/login" className={AUTH_LINK_CLASS}>
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <AuthHeroCard title={AUTH_HERO_TITLE} subtitle={AUTH_HERO_SUBTITLE} />

      <form
        className="flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6"
        onSubmit={handleSubmit}
        aria-label="Restablecer contraseña"
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-headline text-text">Crea una contraseña nueva</h1>
          <p className="text-small text-text-muted">
            A partir de ahora tendrás que iniciar sesión con esta contraseña.
          </p>
        </div>

        {error ? (
          <Alert variant="error" title="No se pudo cambiar la contraseña">
            {error}
          </Alert>
        ) : null}

        <PasswordField
          label="Contraseña nueva"
          name="new_password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          showRules
          error={ruleError}
          placeholder="Nueva123!"
        />

        <Button type="submit" isLoading={isLoading} fullWidth rightIcon="arrow-right">
          Guardar contraseña
        </Button>

        <p className="text-center text-small text-text-muted">
          <Link to="/login" className="font-semibold text-primary">
            Volver a iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
