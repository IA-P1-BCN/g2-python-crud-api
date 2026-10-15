import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { FormField } from '@/components/ui/molecules/FormField'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import { cn } from '@/lib/cn'

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginFormProps = {
  /** Called with the typed credentials when the form is submitted. */
  onSubmit: (credentials: LoginCredentials) => void
  isLoading?: boolean
  /** Server error shown in an Alert. */
  error?: string | null
  /** Where the "Registrarse" link points. */
  registerHref?: string
  className?: string
}

/** Login form: email, password (with show/hide), submit, register link and error/loading states. */
export function LoginForm({
  onSubmit,
  isLoading = false,
  error = null,
  registerHref = '/register',
  className,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dismissed, setDismissed] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form
      className={cn(
        'flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6',
        className,
      )}
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
        <Link to={registerHref} className="font-semibold text-primary">
          Registrarse
        </Link>
      </p>
    </form>
  )
}
