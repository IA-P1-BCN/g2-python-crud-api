import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm, type LoginCredentials } from '@/components/ui/organisms/LoginForm'
import { homePathForRole, useAuth } from '@/auth'

type LocationState = {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(credentials: LoginCredentials) {
    try {
      const user = await login(credentials)
      const state = location.state as LocationState | null
      const destination = state?.from?.pathname ?? homePathForRole(user.role)
      navigate(destination, { replace: true })
    } catch {
      // El error ya se muestra desde AuthContext.
    }
  }

  return <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
}
