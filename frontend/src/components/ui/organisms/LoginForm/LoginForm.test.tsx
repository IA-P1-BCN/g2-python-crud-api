import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/ui/organisms/LoginForm'

function renderForm(props: Partial<Parameters<typeof LoginForm>[0]> = {}) {
  return render(
    <MemoryRouter>
      <LoginForm onSubmit={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  it('envía el correo y la contraseña', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'marcos@example.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secretPassword123')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'marcos@example.com',
      password: 'secretPassword123',
    })
  })

  it('muestra y oculta la contraseña', async () => {
    renderForm()

    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    expect(password).toHaveAttribute('type', 'text')
  })

  it('muestra el error del servidor en un Alert y lo cierra', async () => {
    renderForm({ error: 'Credenciales inválidas' })

    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('deshabilita el envío mientras carga', () => {
    renderForm({ isLoading: true })

    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeDisabled()
  })

  it('enlaza con el registro', () => {
    renderForm()

    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/register')
  })
})
