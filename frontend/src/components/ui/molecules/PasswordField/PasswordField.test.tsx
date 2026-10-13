import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PasswordField } from '@/components/ui/molecules/PasswordField'

function Harness({ showRules = false }: { showRules?: boolean }) {
  const [value, setValue] = useState('')
  return (
    <PasswordField label="Contraseña" value={value} onChange={setValue} showRules={showRules} />
  )
}

describe('PasswordField', () => {
  it('alterna la visibilidad con el ojo y actualiza el aria-label', async () => {
    render(<Harness />)

    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('muestra la lista de reglas mientras se escribe', async () => {
    render(<Harness showRules />)

    await userEvent.type(screen.getByLabelText('Contraseña'), 'a')

    expect(screen.getByText('Al menos 8 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Una mayúscula')).toBeInTheDocument()
    expect(screen.getByText('Un carácter especial')).toBeInTheDocument()
  })

  it('muestra el error cuando se le pasa', () => {
    render(<PasswordField label="Contraseña" value="x" onChange={() => {}} error="Falta algo" />)

    expect(screen.getByText('Falta algo')).toBeInTheDocument()
  })
})
