import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BookingActionBar } from '@/components/ui/organisms/BookingActionBar'

describe('BookingActionBar', () => {
  it('en disponible ofrece Reservar', async () => {
    const onBook = vi.fn()
    render(<BookingActionBar state="available" onBook={onBook} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(onBook).toHaveBeenCalledOnce()
  })

  it('en reservada ofrece Cancelar reserva', async () => {
    const onCancel = vi.fn()
    render(<BookingActionBar state="booked" onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar reserva' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('en completa muestra Sin plazas deshabilitado', () => {
    render(<BookingActionBar state="full" />)

    expect(screen.getByRole('button', { name: 'Sin plazas' })).toBeDisabled()
  })

  it('muestra el error de la regla en una alerta', () => {
    render(<BookingActionBar state="available" error="No quedan plazas" />)

    expect(screen.getByText('No quedan plazas')).toBeInTheDocument()
  })
})
