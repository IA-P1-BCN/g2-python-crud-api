import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/types/schema'
import { useAuth } from './useAuth'

type ProtectedRouteProps = {
  allowedRoles?: Role[]
}

/**
 * Bloquea el acceso a las rutas hijas:
 * - Sin sesión -> redirige al login (recordando a dónde iba).
 * - Con sesión pero sin el rol permitido -> 403.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || user === null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
