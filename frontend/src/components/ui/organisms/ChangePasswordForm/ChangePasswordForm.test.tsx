import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm } from '@/components/ui/organisms/ChangePasswordForm'

describe('ChangePasswordForm', () => {
  it('envía la contraseña actual y la nueva cuando es válida', async () => {
    const onSubmit = vi.fn()
    render(<ChangePasswordForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Contraseña actual'), 'Athletica123!')
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Athletica456!')
    await userEvent.type(screen.getByLabelText('Repetir nueva contraseña'), 'Athletica456!')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(onSubmit).toHaveBeenCalledWith({
      current_password: 'Athletica123!',
      new_password: 'Athletica456!',
    })
  })

  it('no envía si las contraseñas no coinciden', async () => {
    const onSubmit = vi.fn()
    render(<ChangePasswordForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Contraseña actual'), 'Athletica123!')
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Athletica456!')
    await userEvent.type(screen.getByLabelText('Repetir nueva contraseña'), 'Otra123456!')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })
})
