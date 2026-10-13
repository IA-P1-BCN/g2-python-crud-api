import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import type { User } from '@/types/api'

vi.mock('@/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth')>()
  return { ...actual, useAuth: vi.fn() }
})

const mockedUseAuth = vi.mocked(useAuth)

const member: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
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
    updateUser: vi.fn(),
    hasRole: vi.fn(),
    ...partial,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ForbiddenPage />
    </MemoryRouter>,
  )
}

describe('ForbiddenPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el 403 y enlaza a la home del rol', () => {
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )

    renderPage()

    expect(screen.getByRole('heading', { name: '403 · Acceso denegado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute(
      'href',
      '/member',
    )
  })

  it('sin sesión enlaza al login', () => {
    mockedUseAuth.mockReturnValue(authValue({}))

    renderPage()

    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/login')
  })
})
