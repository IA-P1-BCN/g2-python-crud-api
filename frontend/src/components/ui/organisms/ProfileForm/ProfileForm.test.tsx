import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileForm } from '@/components/ui/organisms/ProfileForm'

describe('ProfileForm', () => {
  it('envía el nombre y el email', async () => {
    const onSave = vi.fn()
    render(<ProfileForm defaultName="Socio Uno" defaultEmail="socio@example.com" onSave={onSave} />)

    const name = screen.getByLabelText('Nombre completo')
    await userEvent.clear(name)
    await userEvent.type(name, 'Socio Dos')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith({ full_name: 'Socio Dos', email: 'socio@example.com' })
  })

  it('muestra el mensaje de guardado', () => {
    render(
      <ProfileForm
        defaultName="Socio Uno"
        defaultEmail="socio@example.com"
        onSave={() => {}}
        message="Perfil actualizado"
      />,
    )

    expect(screen.getByText('Perfil actualizado')).toBeInTheDocument()
  })
})
