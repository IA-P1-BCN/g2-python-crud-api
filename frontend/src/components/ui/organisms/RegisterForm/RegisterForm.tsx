import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { FormField } from '@/components/ui/molecules/FormField'
import { PasswordField } from '@/components/ui/molecules/PasswordField'
import { cn } from '@/lib/cn'
import { passwordErrorMessage } from '@/lib/password'

export type RegisterValues = {
  full_name: string
  email: string
  password: string
}

export type RegisterFormProps = {
  /** Called with the typed values when the form is submitted and the password is valid. */
  onSubmit: (values: RegisterValues) => void
  isLoading?: boolean
  /** Server error shown in an Alert (e.g. the email is already registered). */
  error?: string | null
  /** Where the "Iniciar sesión" link points. */
  loginHref?: string
  className?: string
}

/** Register form: name, email and password (with the strength rule), plus error/loading states. */
export function RegisterForm({
  onSubmit,
  isLoading = false,
  error = null,
  loginHref = '/login',
  className,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const invalidPassword = passwordErrorMessage(password)
    if (invalidPassword) {
      setPasswordError(invalidPassword)
      return
    }
    setPasswordError(null)
    onSubmit({ full_name: fullName, email, password })
  }

  return (
    <form
      className={cn(
        'flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6',
        className,
      )}
      onSubmit={handleSubmit}
      aria-label="Crear cuenta"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-headline text-text">Regístrate</h1>
        <p className="text-small text-text-muted">
          Ingresa tus credenciales para crear tu cuenta deportiva.
        </p>
      </div>

      {error && dismissed !== error ? (
        <Alert variant="error" onClose={() => setDismissed(error)}>
          {error}
        </Alert>
      ) : null}

      <FormField
        label="Nombre completo"
        type="text"
        name="full_name"
        autoComplete="name"
        placeholder="Marcos Valle"
        required
        leftIcon="user"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />

      <FormField
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        leftIcon="mail"
        placeholder="athletica@gmail.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <PasswordField
        label="Crea una contraseña"
        name="password"
        value={password}
        onChange={(value) => {
          setPassword(value)
          if (passwordError) setPasswordError(null)
        }}
        autoComplete="new-password"
        required
        placeholder="secretPassword123"
        showRules
        error={passwordError}
      />

      <Button type="submit" isLoading={isLoading} fullWidth rightIcon="arrow-right">
        Crear cuenta
      </Button>

      <p className="text-center text-small text-text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to={loginHref} className="font-semibold text-primary">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
