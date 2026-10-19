import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'

vi.mock('@/api', () => ({
  authApi: { forgotPassword: vi.fn() },
  toApiError: (error: unknown) => error,
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPasswordPage />
    </MemoryRouter>,
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pide el email y, con el 202, muestra el mensaje fijo con su enlace', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined)

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'socio@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText(/Si el email está registrado/)).toBeInTheDocument()
    expect(authApi.forgotPassword).toHaveBeenCalledWith({ email: 'socio@example.com' })
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('muestra el error de la API en un Alert y sigue en el formulario', async () => {
    vi.mocked(authApi.forgotPassword).mockRejectedValue({
      status: 500,
      message: 'Error inesperado',
    })

    renderPage()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'socio@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Error inesperado')
    expect(screen.queryByText(/Si el email está registrado/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('enlaza al login desde el formulario', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'Volver a iniciar sesión' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
