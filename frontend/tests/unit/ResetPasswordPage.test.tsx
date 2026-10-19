import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { INVALID_LINK_MESSAGE } from '@/lib/auth-copy'

vi.mock('@/api', () => ({
  authApi: { resetPassword: vi.fn() },
  toApiError: (error: unknown) => error,
}))

function renderPage(search = '?token=abc') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <ResetPasswordPage />
    </MemoryRouter>,
  )
}

async function submitPassword(password: string) {
  await userEvent.type(screen.getByLabelText('Contraseña nueva'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
}

describe('ResetPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin token avisa sin llamar a la API', () => {
    renderPage('')

    expect(screen.getByRole('alert')).toHaveTextContent(INVALID_LINK_MESSAGE)
    expect(authApi.resetPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('con token pide la contraseña nueva con sus reglas', () => {
    renderPage()

    expect(screen.getByLabelText('Contraseña nueva')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeInTheDocument()
    // The strength checklist of PasswordField is visible before typing anything.
    expect(screen.getByText('Al menos 8 caracteres')).toBeInTheDocument()
  })

  it('cambia la contraseña con el token y enlaza al login', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue(undefined)

    renderPage()

    await submitPassword('Nueva123!')

    expect(
      await screen.findByText('Ya puedes iniciar sesión con tu contraseña nueva.'),
    ).toBeInTheDocument()
    expect(authApi.resetPassword).toHaveBeenCalledWith({ token: 'abc', new_password: 'Nueva123!' })
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('muestra el mensaje del backend cuando el token ya no vale (400)', async () => {
    vi.mocked(authApi.resetPassword).mockRejectedValue({ status: 400, message: 'Token inválido' })

    renderPage()

    await submitPassword('Nueva123!')

    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido')
    expect(screen.getByLabelText('Contraseña nueva')).toBeInTheDocument()
  })

  it('mete el mensaje de la regla bajo el campo con 422', async () => {
    vi.mocked(authApi.resetPassword).mockRejectedValue({
      status: 422,
      message: 'La contraseña debe tener al menos 8 caracteres',
    })

    renderPage()

    await submitPassword('corta')

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres'),
    ).toBeInTheDocument()
    // The rule goes under the field, not to the Alert.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
