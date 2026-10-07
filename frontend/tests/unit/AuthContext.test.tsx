import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { AuthProvider, useAuth } from '@/auth'
import { tokenStorage } from '@/auth/tokenStorage'
import type { User } from '@/types/api'

vi.mock('@/api', () => ({
  authApi: { me: vi.fn(), login: vi.fn(), register: vi.fn() },
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
}

const freshUser: User = { ...staleUser, full_name: 'Socio Actualizado' }

function Consumer() {
  const { user } = useAuth()
  return <span>{user?.full_name ?? 'sin sesión'}</span>
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('restaura la sesión contra /auth/me al arrancar', async () => {
    tokenStorage.setSession('token-123', staleUser)
    vi.mocked(authApi.me).mockResolvedValue(freshUser)

    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Socio Actualizado')).toBeInTheDocument()
    expect(authApi.me).toHaveBeenCalledTimes(1)
  })

  it('no llama a /auth/me si no hay token', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('sin sesión')).toBeInTheDocument()
    expect(authApi.me).not.toHaveBeenCalled()
  })
})
