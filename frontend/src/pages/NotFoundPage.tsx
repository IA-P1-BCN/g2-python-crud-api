import { Link } from 'react-router-dom'
import { homePathForRole, useAuth } from '@/auth'
import { Icon } from '@/components/ui/atoms/Icon'

export function NotFoundPage() {
  const { user } = useAuth()
  const home = user ? homePathForRole(user.role) : '/login'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-sunken text-text-muted">
        <Icon name="search" size={24} />
      </span>
      <h1 className="font-display text-display text-text">404 · Página no encontrada</h1>
      <p className="max-w-prose text-body text-text-muted">
        La página que buscas no existe o se ha movido.
      </p>
      <Link to={home} className="rounded-full bg-primary px-6 py-3 font-display text-body text-ink">
        Volver
      </Link>
    </main>
  )
}
