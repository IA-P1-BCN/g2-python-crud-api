import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { LoginPage } from '@/pages/LoginPage'
import type { User } from '@/types/api'

vi.mock('@/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth')>()
  return { ...actual, useAuth: vi.fn() }
})

const mockedUseAuth = vi.mocked(useAuth)

const user: User = {
  id: 1,
  email: 'marcos.valle@performance.com',
  full_name: 'Marcos Valle',
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
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/member" element={<h1>Home del socio</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => mockedUseAuth.mockReset())

  it('envía el formulario de login con email y contraseña', async () => {
    const login = vi.fn().mockResolvedValue(user)
    mockedUseAuth.mockReturnValue(authValue({ login }))

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secretPassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(login).toHaveBeenCalledWith({
      email: 'marcos@example.com',
      password: 'secretPassword123',
    })
  })

  it('muestra el error del servidor en un Alert', () => {
    mockedUseAuth.mockReturnValue(authValue({ error: 'Credenciales inválidas' }))

    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })

  it('redirige al home del rol tras iniciar sesión', async () => {
    const login = vi.fn().mockResolvedValue(user)
    mockedUseAuth.mockReturnValue(authValue({ login }))

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secretPassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Home del socio' })).toBeInTheDocument()
  })

  it('pide el código de verificación cuando el login responde totp_required', async () => {
    const login = vi
      .fn()
      .mockRejectedValueOnce({
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 401,
          data: { detail: 'Se requiere el segundo factor.', code: 'totp_required' },
        },
      })
      .mockResolvedValueOnce(user)

    mockedUseAuth.mockReturnValue(authValue({ login }))

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secretPassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Se requiere el segundo factor.')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Verificación en dos pasos' }),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Código de 6 cifras'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(login).toHaveBeenCalledTimes(2)
    expect(login).toHaveBeenLastCalledWith({
      email: 'marcos@example.com',
      password: 'secretPassword123',
      totp_code: '123456',
    })
    expect(await screen.findByRole('heading', { name: 'Home del socio' })).toBeInTheDocument()
  })

  it('no pide el código cuando el error no es totp_required', async () => {
    const login = vi.fn().mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 401, data: { detail: 'Credenciales inválidas' } },
    })

    mockedUseAuth.mockReturnValue(authValue({ login }))

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'badPassword')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      screen.queryByRole('heading', { name: 'Verificación en dos pasos' }),
    ).not.toBeInTheDocument()
  })
})
