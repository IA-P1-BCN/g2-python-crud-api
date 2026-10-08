import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SessionCard, type SessionAttendee } from '@/components/ui/molecules/SessionCard'

const attendees: SessionAttendee[] = [
  { id: 1, name: 'Socio Uno' },
  { id: 2, name: 'Socio Dos' },
  { id: 3, name: 'Socio Tres' },
  { id: 4, name: 'Socio Cuatro' },
]

describe('SessionCard', () => {
  it('muestra la clase, el horario y la sala', () => {
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={12}
        capacity={20}
        role="trainer"
      />,
    )

    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(screen.getByText('12 / 20 inscritos')).toBeInTheDocument()
  })

  it('refleja la ocupación en la barra de progreso', () => {
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={12}
        capacity={20}
        role="trainer"
      />,
    )

    const progress = screen.getByRole('progressbar', { name: 'Ocupación de la sesión' })
    expect(progress).toHaveAttribute('value', '12')
    expect(progress).toHaveAttribute('max', '20')
  })

  it('limita la pila de avatares y muestra el contador +N', () => {
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={4}
        capacity={20}
        attendees={attendees}
        role="trainer"
      />,
    )

    expect(screen.getByText('SU')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByLabelText('4 inscritos')).toBeInTheDocument()
  })

  it('en la variante entrenador ofrece "Ver inscritos"', async () => {
    const onAction = vi.fn()
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={12}
        capacity={20}
        role="trainer"
        onAction={onAction}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Ver inscritos' }))

    expect(onAction).toHaveBeenCalledOnce()
  })

  it('en la variante miembro muestra estado y plazas libres', () => {
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={15}
        capacity={20}
        role="member"
        state="booked"
      />,
    )

    expect(screen.getByText('Reservada')).toBeInTheDocument()
    expect(screen.getByText('5 plazas libres')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver inscritos' })).not.toBeInTheDocument()
  })

  it('en la variante miembro indica cuando no quedan plazas', () => {
    render(
      <SessionCard
        title="Yoga"
        time="10:00 – 11:00"
        room="Sala 1"
        enrolled={20}
        capacity={20}
        role="member"
        state="full"
      />,
    )

    expect(screen.getByText('Completa')).toBeInTheDocument()
    expect(screen.getByText('Sin plazas')).toBeInTheDocument()
  })
})
