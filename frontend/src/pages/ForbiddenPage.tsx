import { Link } from 'react-router-dom'
import { homePathForRole, useAuth } from '@/auth'
import { Icon } from '@/components/ui/atoms/Icon'

export function ForbiddenPage() {
  const { user } = useAuth()
  const home = user ? homePathForRole(user.role) : '/login'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name="alert-triangle" size={24} />
      </span>
      <h1 className="font-display text-display text-text">403 · Acceso denegado</h1>
      <p className="max-w-prose text-body text-text-muted">
        Tu rol no tiene permiso para ver esta sección.
      </p>
      <Link to={home} className="rounded-full bg-primary px-6 py-3 font-display text-body text-ink">
        Volver al inicio
      </Link>
    </main>
  )
}
