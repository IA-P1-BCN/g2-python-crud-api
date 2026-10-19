import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi, toApiError } from '@/api'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { AuthHeroCard } from '@/components/ui/molecules/AuthHeroCard'
import { FormField } from '@/components/ui/molecules/FormField'
import { AUTH_HERO_SUBTITLE, AUTH_HERO_TITLE, AUTH_LINK_CLASS } from '@/lib/auth-copy'

/** The API answers 202 whether the email exists or not, so the message never changes. */
const SENT_MESSAGE = 'Si el email está registrado, te hemos enviado un enlace'

/** Public page that asks for a recovery link when the password has been forgotten. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-card border border-line bg-surface p-6 text-center">
        <h1 className="font-display text-headline text-text">Revisa tu correo</h1>

        <Alert variant="success">{SENT_MESSAGE}</Alert>

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
        aria-label="Recuperar contraseña"
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-headline text-text">¿Olvidaste tu contraseña?</h1>
          <p className="text-small text-text-muted">
            Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña
            nueva.
          </p>
        </div>

        {error ? (
          <Alert variant="error" title="No se pudo enviar el enlace">
            {error}
          </Alert>
        ) : null}

        <FormField
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          required
          leftIcon="mail"
          placeholder="marcos.valle@performance.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Button type="submit" isLoading={isLoading} fullWidth rightIcon="mail">
          Enviar enlace
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
