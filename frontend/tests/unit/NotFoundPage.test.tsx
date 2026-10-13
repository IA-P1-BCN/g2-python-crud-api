import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { NotFoundPage } from '@/pages/NotFoundPage'
import type { User } from '@/types/api'

vi.mock('@/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth')>()
  return { ...actual, useAuth: vi.fn() }
})

const mockedUseAuth = vi.mocked(useAuth)

const trainer: User = {
  id: 2,
  email: 'trainer@example.com',
  full_name: 'Entrenador Uno',
  role: 'trainer',
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
      <NotFoundPage />
    </MemoryRouter>,
  )
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el 404 y enlaza a la home del rol', () => {
    mockedUseAuth.mockReturnValue(
      authValue({ user: trainer, token: 'token', isAuthenticated: true }),
    )

    renderPage()

    expect(screen.getByRole('heading', { name: '404 · Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver' })).toHaveAttribute('href', '/trainer')
  })

  it('sin sesión enlaza al login', () => {
    mockedUseAuth.mockReturnValue(authValue({}))

    renderPage()

    expect(screen.getByRole('link', { name: 'Volver' })).toHaveAttribute('href', '/login')
  })
})
