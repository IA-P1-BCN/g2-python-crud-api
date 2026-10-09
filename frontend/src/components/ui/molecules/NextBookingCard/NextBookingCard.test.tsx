import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { NextBookingCard, type NextBooking } from '@/components/ui/molecules/NextBookingCard'

const booking: NextBooking = {
  id: 7,
  className: 'Yoga',
  date: '06/10/2026',
  time: '10:00 – 11:00',
  room: 'Sala 1',
  trainer: 'Ana López',
}

function renderCard(props: Partial<Parameters<typeof NextBookingCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <NextBookingCard booking={booking} {...props} />
    </MemoryRouter>,
  )
}

describe('NextBookingCard', () => {
  it('muestra los datos de la reserva y cancela', async () => {
    const onCancel = vi.fn()
    renderCard({ onCancel })

    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('06/10/2026 · 10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(screen.getByText('Entrenador: Ana López')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar reserva' }))

    expect(onCancel).toHaveBeenCalledWith(7)
  })

  it('muestra el estado vacío con enlace a Reservas', () => {
    render(
      <MemoryRouter>
        <NextBookingCard booking={null} />
      </MemoryRouter>,
    )

    expect(screen.getByText('No tienes reservas próximas.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver clases y reservar' })).toHaveAttribute(
      'href',
      '/member/bookings',
    )
  })
})
