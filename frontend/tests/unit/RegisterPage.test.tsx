import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { RegisterPage } from '@/pages/RegisterPage'
import type { User } from '@/types/api'

vi.mock('@/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth')>()
  return { ...actual, useAuth: vi.fn() }
})

const mockedUseAuth = vi.mocked(useAuth)

const user: User = {
  id: 1,
  email: 'nueva@example.com',
  full_name: 'Nueva Socia',
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
    hasRole: vi.fn(),
    ...partial,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => mockedUseAuth.mockReset())

  it('envía el formulario de registro', async () => {
    const register = vi.fn().mockResolvedValue(user)
    mockedUseAuth.mockReturnValue(authValue({ register }))

    renderPage()

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Nueva Socia')
    await userEvent.type(screen.getByLabelText('Email'), 'nueva@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Registrarme' }))

    expect(register).toHaveBeenCalledWith({
      full_name: 'Nueva Socia',
      email: 'nueva@example.com',
      password: 'secret123',
    })
  })

  it('muestra el error de la API', () => {
    mockedUseAuth.mockReturnValue(authValue({ error: 'El email ya está registrado' }))

    renderPage()

    expect(screen.getByText('El email ya está registrado')).toBeInTheDocument()
  })
})
