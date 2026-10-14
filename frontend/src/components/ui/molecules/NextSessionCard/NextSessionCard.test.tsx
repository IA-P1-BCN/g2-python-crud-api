import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NextSessionCard, type NextSession } from '@/components/ui/molecules/NextSessionCard'

const session: NextSession = {
  id: 10,
  className: 'Yoga',
  time: '10:00 – 11:00',
  room: 'Sala 1',
  enrolled: 12,
  capacity: 20,
  attendees: [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Luis' },
  ],
}

describe('NextSessionCard', () => {
  it('muestra los datos de la sesión y avisa con Ver inscritos', async () => {
    const onAction = vi.fn()
    render(<NextSessionCard session={session} onAction={onAction} />)

    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(screen.getByText('12 de 20 plazas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Ocupación de la sesión' })).toHaveAttribute(
      'aria-valuenow',
      '12',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Ver inscritos' }))

    expect(onAction).toHaveBeenCalledWith(10)
  })

  it('muestra el estado vacío cuando no hay sesión', () => {
    render(<NextSessionCard session={null} />)

    expect(screen.getByText('No tienes más sesiones hoy.')).toBeInTheDocument()
  })
})
