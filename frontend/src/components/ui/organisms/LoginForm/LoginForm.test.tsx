import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm, type LoginFormProps } from '@/components/ui/organisms/LoginForm'

function renderForm(props: Partial<LoginFormProps> = {}) {
  const onSubmit = props.onSubmit ?? vi.fn()
  render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  )
  return onSubmit
}

describe('LoginForm', () => {
  it('muestra el título y los campos dentro de su tarjeta', () => {
    renderForm()

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/register')
  })

  it('envía email y contraseña', async () => {
    const onSubmit = renderForm()

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secretPassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'marcos@example.com',
      password: 'secretPassword123',
    })
  })

  it('muestra el error del servidor en un Alert y permite descartarlo', async () => {
    renderForm({ error: 'Credenciales inválidas' })

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Credenciales inválidas')

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
