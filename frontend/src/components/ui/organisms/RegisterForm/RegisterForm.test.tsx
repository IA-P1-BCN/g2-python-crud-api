import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RegisterForm } from '@/components/ui/organisms/RegisterForm'
import { PASSWORD_RULE } from '@/lib/password'

function renderForm(props: Partial<Parameters<typeof RegisterForm>[0]> = {}) {
  return render(
    <MemoryRouter>
      <RegisterForm onSubmit={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

async function fillForm(password = 'Athletica123!') {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Nueva Socia')
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'nueva@example.com')
  await userEvent.type(screen.getByLabelText('Crea una contraseña'), password)
}

describe('RegisterForm', () => {
  it('envía el nombre, el correo y la contraseña', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(onSubmit).toHaveBeenCalledWith({
      full_name: 'Nueva Socia',
      email: 'nueva@example.com',
      password: 'Athletica123!',
    })
  })

  it('no envía si la contraseña no cumple la regla', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await fillForm('secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(PASSWORD_RULE)).toBeInTheDocument()
  })

  it('muestra el error del servidor en un Alert y lo cierra', async () => {
    renderForm({ error: 'El email ya está registrado' })

    expect(screen.getByRole('alert')).toHaveTextContent('El email ya está registrado')

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('deshabilita el envío mientras carga', () => {
    renderForm({ isLoading: true })

    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeDisabled()
  })

  it('enlaza con el inicio de sesión', () => {
    renderForm()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
  })
})
