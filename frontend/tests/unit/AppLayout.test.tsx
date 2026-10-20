import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { AppLayout } from '@/layouts/AppLayout'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

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

const ADMIN: NonNullable<AuthContextValue['user']> = {
  id: 1,
  email: 'admin@athletica.dev',
  full_name: 'Nayeli Córdova',
  role: 'admin',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  deactivated_at: null,
}

function renderLayout(path = '/admin/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<p>contenido dashboard</p>} />
          <Route path="/admin/members" element={<p>contenido socios</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue(authValue({ isAuthenticated: true, user: ADMIN }))
  })

  it('no renderiza nada sin sesión', () => {
    mockedUseAuth.mockReturnValue(authValue({}))

    const { container } = renderLayout()

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra la navegación del rol en el lateral del escritorio', () => {
    renderLayout()

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/admin/dashboard',
    )
    expect(within(nav).getByRole('link', { name: 'Horarios' })).toBeInTheDocument()
    expect(screen.getByText('contenido dashboard')).toBeInTheDocument()
  })

  it('abre el menú móvil desde la cabecera con los mismos enlaces', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))

    const menu = within(screen.getByRole('dialog')).getByRole('navigation', {
      name: 'Navegación principal',
    })
    expect(within(menu).getByRole('link', { name: 'Socios' })).toHaveAttribute(
      'href',
      '/admin/members',
    )
  })

  it('cierra el menú móvil al elegir un enlace', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const menu = within(screen.getByRole('dialog')).getByRole('navigation', {
      name: 'Navegación principal',
    })
    await userEvent.click(within(menu).getByRole('link', { name: 'Socios' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('contenido socios')).toBeInTheDocument()
  })
})
