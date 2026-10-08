import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/ui/atoms/Button'
import { useAuth } from '@/auth'
import type { Role } from '@/types/api'

type NavItem = {
  to: string
  label: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/member/classes', label: 'Clases', roles: ['member'] },
  { to: '/member/bookings', label: 'Mis reservas', roles: ['member'] },
  { to: '/member/membership', label: 'Mi membresía', roles: ['member'] },
  { to: '/trainer/sessions', label: 'Mis sesiones', roles: ['trainer'] },
  { to: '/trainer/members', label: 'Mis socios', roles: ['trainer'] },
  { to: '/admin/dashboard', label: 'Resumen', roles: ['admin'] },
  { to: '/admin/plans', label: 'Planes', roles: ['admin'] },
  { to: '/admin/members', label: 'Socios', roles: ['admin'] },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  if (!user) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">Gym</div>
        <nav className="app__nav" aria-label="Navegación principal">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app__link${isActive ? ' app__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app__user">
          <span>
            {user.full_name} · <em>{user.role}</em>
          </span>
          <Button variant="ghost" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
