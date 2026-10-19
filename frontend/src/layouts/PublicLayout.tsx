import { Link, NavLink, Outlet } from 'react-router-dom'
import { homePathForRole, useAuth } from '@/auth'
import { Logo } from '@/components/ui/atoms/Logo'
import { buttonStyles } from '@/components/ui/atoms/Button'
import { SiteFooter } from '@/components/ui/organisms/SiteFooter'

const NAV_LINK = 'rounded-full px-3 py-2 text-body transition-colors'

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? `${NAV_LINK} bg-primary-soft text-primary`
    : `${NAV_LINK} text-text-muted hover:text-text`
}

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <Link to="/" aria-label="Ir al inicio" className="order-1">
          <Logo />
        </Link>

        <nav
          aria-label="Navegación pública"
          className="order-3 w-full overflow-x-auto sm:order-2 sm:w-auto sm:flex-1"
        >
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Inicio
            </NavLink>
            <NavLink to="/plans" className={navClass}>
              Planes
            </NavLink>
          </div>
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
          {isAuthenticated && user ? (
            <Link to={homePathForRole(user.role)} className={buttonStyles({ variant: 'primary' })}>
              Mi área
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonStyles({ variant: 'secondary' })}>
                Iniciar sesión
              </Link>
              <Link to="/register" className={buttonStyles({ variant: 'primary' })}>
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-4 py-6">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
