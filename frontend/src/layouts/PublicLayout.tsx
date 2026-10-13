import { Link, NavLink, Outlet } from 'react-router-dom'
import { homePathForRole, useAuth } from '@/auth'

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'public__link public__link--active' : 'public__link'
}

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="public">
      <header className="public__header">
        <Link to="/" className="public__brand">
          Gym
        </Link>
        <nav className="public__nav" aria-label="Navegación pública">
          <NavLink to="/" end className={navClass}>
            Inicio
          </NavLink>
          <NavLink to="/plans" className={navClass}>
            Planes
          </NavLink>
        </nav>
        <div className="public__actions">
          {isAuthenticated && user ? (
            <Link to={homePathForRole(user.role)} className="btn btn--primary">
              Mi área
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn--secondary">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn--primary">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="public__main">
        <Outlet />
      </main>
    </div>
  )
}
