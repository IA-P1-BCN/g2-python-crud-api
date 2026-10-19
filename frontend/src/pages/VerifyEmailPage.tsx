import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authApi, toApiError } from '@/api'
import { homePathForRole, useAuth } from '@/auth'
import { Alert } from '@/components/ui/molecules/Alert'
import { AUTH_LINK_CLASS, INVALID_LINK_MESSAGE } from '@/lib/auth-copy'

/** Public page that confirms an email with the token of the verification link. */
export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { isAuthenticated, user } = useAuth()

  const verify = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      await authApi.verifyEmail(token ?? '')
      return true
    },
    enabled: Boolean(token),
    retry: false,
  })

  const home = isAuthenticated && user ? homePathForRole(user.role) : '/login'
  const homeLabel = isAuthenticated ? 'Ir a mi área' : 'Ir a iniciar sesión'

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-card border border-line bg-surface p-6 text-center">
      <h1 className="font-display text-headline text-text">Verifica tu correo</h1>

      {!token ? (
        <>
          <Alert variant="error">{INVALID_LINK_MESSAGE}</Alert>
          <Link to="/login" className={AUTH_LINK_CLASS}>
            Ir a iniciar sesión
          </Link>
        </>
      ) : verify.isLoading ? (
        <p role="status" className="text-body text-text-muted">
          Verificando tu correo…
        </p>
      ) : verify.isError ? (
        <>
          <Alert variant="error">{toApiError(verify.error).message}</Alert>
          <Link to="/login" className={AUTH_LINK_CLASS}>
            Ir a iniciar sesión
          </Link>
        </>
      ) : (
        <>
          <Alert variant="success">Tu correo ya está verificado.</Alert>
          <Link to={home} className={AUTH_LINK_CLASS}>
            {homeLabel}
          </Link>
        </>
      )}
    </div>
  )
}
