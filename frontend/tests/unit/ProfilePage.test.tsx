import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '@/api'
import { useAuth, type AuthContextValue } from '@/auth'
import { ProfilePage } from '@/pages/member/ProfilePage'
import type { User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))

vi.mock('@/api', () => ({
  usersApi: { updateProfile: vi.fn(), changePassword: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
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

const logout = vi.fn()
const updateUser = vi.fn()

function authValue(partial: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout,
    updateUser,
    hasRole: vi.fn(),
    ...partial,
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: member, token: 'token', isAuthenticated: true }),
    )
  })

  it('muestra la cabecera, los formularios y cerrar sesión', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Socio Uno' })).toBeInTheDocument()
    expect(screen.getByText('Socio')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Mis datos' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Cambiar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('guarda los datos del perfil', async () => {
    vi.mocked(usersApi.updateProfile).mockResolvedValue(member)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(usersApi.updateProfile).toHaveBeenCalledWith(1, {
        full_name: 'Socio Uno',
        email: 'socio@example.com',
      }),
    )
  })

  it('cierra sesión al pulsar Cerrar sesión', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(logout).toHaveBeenCalledOnce()
  })
})
