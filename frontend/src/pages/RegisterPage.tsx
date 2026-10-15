import { Navigate, useNavigate } from 'react-router-dom'
import { RegisterForm, type RegisterValues } from '@/components/ui/organisms/RegisterForm'
import { homePathForRole, useAuth } from '@/auth'

export function RegisterPage() {
  const { register, isLoading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(values: RegisterValues) {
    try {
      const user = await register(values)
      navigate(homePathForRole(user.role), { replace: true })
    } catch {
      // El error ya se muestra desde AuthContext.
    }
  }

  return <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
}
