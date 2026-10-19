import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { AuthProvider, useAuth } from '@/auth'
import { tokenStorage } from '@/auth/tokenStorage'
import type { User } from '@/types/api'

vi.mock('@/api', () => ({
  authApi: { me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
  setUnauthorizedHandler: vi.fn(),
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const staleUser: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Antiguo',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const freshUser: User = { ...staleUser, full_name: 'Socio Actualizado' }

function Consumer() {
  const { user, login, logout } = useAuth()
  return (
    <div>
      <span>{user?.full_name ?? 'sin sesión'}</span>
      <button onClick={() => void login({ email: 'socio@example.com', password: 'secret' })}>
        Entrar
      </button>
      <button onClick={() => void logout()}>Salir</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('restaura la sesión contra /auth/me al arrancar', async () => {
    tokenStorage.setSession('token-123', 'refresh-123', staleUser)
    vi.mocked(authApi.me).mockResolvedValue(freshUser)

    renderProvider()

    expect(await screen.findByText('Socio Actualizado')).toBeInTheDocument()
    expect(authApi.me).toHaveBeenCalledTimes(1)
  })

  it('no llama a /auth/me si no hay token', () => {
    renderProvider()

    expect(screen.getByText('sin sesión')).toBeInTheDocument()
    expect(authApi.me).not.toHaveBeenCalled()
  })

  it('login guarda el refresh token junto al de acceso', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'token-123',
      refresh_token: 'refresh-123',
      token_type: 'bearer',
      user: freshUser,
    })

    renderProvider()
    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Socio Actualizado')).toBeInTheDocument()
    expect(tokenStorage.getToken()).toBe('token-123')
    expect(tokenStorage.getRefreshToken()).toBe('refresh-123')
  })

  it('logout revoca la sesión en el backend con el refresh token y borra ambos', async () => {
    tokenStorage.setSession('token-123', 'refresh-123', staleUser)
    vi.mocked(authApi.logout).mockResolvedValue(undefined)

    renderProvider()
    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('sin sesión')).toBeInTheDocument())
    expect(authApi.logout).toHaveBeenCalledWith('refresh-123')
    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('logout borra la sesión aunque la llamada al backend falle', async () => {
    tokenStorage.setSession('token-123', 'refresh-123', staleUser)
    vi.mocked(authApi.logout).mockRejectedValue(new Error('sin red'))

    renderProvider()
    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('sin sesión')).toBeInTheDocument())
    expect(authApi.logout).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })
})
