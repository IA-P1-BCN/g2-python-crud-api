import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it('usa role alert cuando es un error', () => {
    render(<Alert variant="error">Algo salió mal</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('usa role status en el resto de variantes', () => {
    render(<Alert variant="success">Hecho</Alert>)

    expect(screen.getByRole('status')).toHaveTextContent('Hecho')
  })

  it('muestra el título cuando se le pasa', () => {
    render(
      <Alert variant="error" title="Acceso denegado">
        Credenciales incorrectas.
      </Alert>,
    )

    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
    expect(screen.getByText('Credenciales incorrectas.')).toBeInTheDocument()
  })

  it('no muestra el botón de cierre sin onClose', () => {
    render(<Alert variant="info">Sin cierre</Alert>)

    expect(screen.queryByRole('button', { name: 'Cerrar aviso' })).not.toBeInTheDocument()
  })

  it('cierra el aviso al pulsar la X', async () => {
    const onClose = vi.fn()
    render(
      <Alert variant="error" onClose={onClose}>
        Credenciales incorrectas.
      </Alert>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
