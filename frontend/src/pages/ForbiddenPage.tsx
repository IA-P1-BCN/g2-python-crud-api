import { Link } from 'react-router-dom'
import { useAuth } from '@/auth'
import { homePathForRole } from '@/auth'

export function ForbiddenPage() {
  const { user } = useAuth()
  const home = user ? homePathForRole(user.role) : '/login'

  return (
    <div className="page page--centered">
      <h1>403 · Acceso denegado</h1>
      <p>Tu rol no tiene permiso para ver esta sección.</p>
      <Link to={home}>Volver al inicio</Link>
    </div>
  )
}
