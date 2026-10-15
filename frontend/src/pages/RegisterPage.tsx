import { Navigate, useNavigate } from 'react-router-dom'
import { AuthHeroCard } from '@/components/ui/molecules/AuthHeroCard'
import { RegisterForm, type RegisterValues } from '@/components/ui/organisms/RegisterForm'
import { homePathForRole, useAuth } from '@/auth'
import { AUTH_HERO_SUBTITLE, AUTH_HERO_TITLE } from '@/lib/auth-copy'

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

  return (
    <div className="flex w-full flex-col gap-4">
      <AuthHeroCard title={AUTH_HERO_TITLE} subtitle={AUTH_HERO_SUBTITLE} />
      <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </div>
  )
}
