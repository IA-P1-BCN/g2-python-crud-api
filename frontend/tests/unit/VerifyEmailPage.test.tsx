import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import type { User } from '@/types/api'

vi.mock('@/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth')>()
  return { ...actual, useAuth: vi.fn() }
})

vi.mock('@/api', () => ({
  authApi: { verifyEmail: vi.fn() },
  toApiError: (error: unknown) => error,
}))

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

function renderPage(search = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/verify-email${search}`]}>
        <VerifyEmailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(authValue({}))
  })

  it('verifica el correo con el token y enlaza al login', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined)

    renderPage('?token=abc')

    expect(await screen.findByText('Tu correo ya está verificado.')).toBeInTheDocument()
    expect(authApi.verifyEmail).toHaveBeenCalledWith('abc')
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('muestra el mensaje de la API si el enlace no vale', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue({
      status: 400,
      message: 'El enlace no es válido o ha caducado',
    })

    renderPage('?token=caducado')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El enlace no es válido o ha caducado',
    )
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeInTheDocument()
  })

  it('sin token avisa sin llamar a la API', async () => {
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El enlace no es válido o ha caducado',
    )
    expect(authApi.verifyEmail).not.toHaveBeenCalled()
  })

  it('enlaza al inicio del rol si ya hay sesión', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined)
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )

    renderPage('?token=abc')

    expect(await screen.findByText('Tu correo ya está verificado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mi área' })).toHaveAttribute('href', '/member')
  })
})
