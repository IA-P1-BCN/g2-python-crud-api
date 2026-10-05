import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { useAuth } from '@/auth/useAuth'
import type { AuthContextValue } from '@/auth'
import type { Role, User } from '@/types/api'

vi.mock('@/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const memberUser: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

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
    hasRole: vi.fn(),
    ...partial,
  }
}

function renderRoute(initialPath: string, allowedRoles?: Role[]) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/private" element={<div>contenido privado</div>} />
        </Route>
        <Route path="/login" element={<div>página de login</div>} />
        <Route path="/forbidden" element={<div>acceso denegado</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('redirige al login cuando no hay sesión', () => {
    mockedUseAuth.mockReturnValue(authValue({}))

    renderRoute('/private')

    expect(screen.getByText('página de login')).toBeInTheDocument()
  })

  it('permite el acceso cuando el rol está autorizado', () => {
    mockedUseAuth.mockReturnValue(
      authValue({ user: memberUser, token: 'token', isAuthenticated: true }),
    )

    renderRoute('/private', ['member'])

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('bloquea el acceso cuando el rol no está autorizado', () => {
    mockedUseAuth.mockReturnValue(
      authValue({ user: memberUser, token: 'token', isAuthenticated: true }),
    )

    renderRoute('/private', ['admin'])

    expect(screen.getByText('acceso denegado')).toBeInTheDocument()
  })
})
