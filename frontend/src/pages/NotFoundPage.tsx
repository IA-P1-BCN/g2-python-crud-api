import { Link } from 'react-router-dom'
import { useAuth } from '@/auth'

export function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="page page--centered">
      <h1>404 · Página no encontrada</h1>
      <Link to={isAuthenticated ? '/' : '/login'}>Volver</Link>
    </div>
  )
}
