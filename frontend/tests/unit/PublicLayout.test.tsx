import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { PublicLayout } from '@/layouts/PublicLayout'

vi.mock('@/auth', () => ({
  useAuth: vi.fn(),
  homePathForRole: vi.fn((role: string) => `/${role}`),
}))

const mockedUseAuth = vi.mocked(useAuth)

function authValue(partial: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    hasRole: vi.fn(),
    ...partial,
  }
}

const MEMBER: NonNullable<AuthContextValue['user']> = {
  id: 1,
  email: 'ana@example.com',
  full_name: 'Ana García',
  role: 'member',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  deactivated_at: null,
}

function renderLayout(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<p>contenido landing</p>} />
          <Route path="/plans" element={<p>contenido planes</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicLayout', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue(authValue({}))
  })

  it('muestra la navegación pública con inicio y planes', () => {
    renderLayout()

    const nav = screen.getByRole('navigation', { name: 'Navegación pública' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Planes' })).toHaveAttribute('href', '/plans')
  })

  it('ofrece iniciar sesión y crear cuenta sin sesión', () => {
    renderLayout()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register')
  })

  it('enlaza a mi área cuando hay sesión', () => {
    mockedUseAuth.mockReturnValue(authValue({ isAuthenticated: true, user: MEMBER }))

    renderLayout()

    expect(screen.getByRole('link', { name: 'Mi área' })).toHaveAttribute('href', '/member')
    expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()
  })

  it('muestra el logo enlazado al inicio', () => {
    renderLayout()

    const banner = screen.getByRole('banner')
    const logo = within(banner).getByRole('link', { name: 'Ir al inicio' })
    expect(logo).toHaveTextContent('Athletica')
  })

  it('muestra el pie de página compartido', () => {
    renderLayout()

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(`${new Date().getFullYear()} Athletica`)
    expect(footer).toHaveTextContent('Todos los derechos reservados.')
  })

  it('renderiza el contenido de la ruta hija', () => {
    renderLayout()

    expect(screen.getByText('contenido landing')).toBeInTheDocument()
  })

  it('renderiza la página de planes dentro del layout', () => {
    renderLayout('/plans')

    expect(screen.getByText('contenido planes')).toBeInTheDocument()
  })
})
