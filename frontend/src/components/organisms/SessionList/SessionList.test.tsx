import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SessionList, type SessionListItem } from '@/components/organisms/SessionList'

const sessions: SessionListItem[] = [
  { id: 1, title: 'Yoga', time: '10:00 – 11:00', room: 'Sala 1', enrolled: 12, capacity: 20 },
  { id: 2, title: 'Pilates', time: '11:00 – 12:00', room: 'Sala 2', enrolled: 8, capacity: 15 },
]

describe('SessionList', () => {
  it('renderiza una tarjeta por sesión', () => {
    render(<SessionList sessions={sessions} role="trainer" />)

    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('Pilates')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Ver inscritos' })).toHaveLength(2)
  })

  it('muestra esqueletos mientras carga', () => {
    const { container } = render(<SessionList sessions={[]} role="trainer" isLoading />)

    expect(screen.getByLabelText('Cargando sesiones')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('.session-list__skeleton')).toHaveLength(3)
    expect(screen.queryByText('No hay sesiones.')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío', () => {
    render(<SessionList sessions={[]} role="member" emptyMessage="Sin sesiones hoy." />)

    expect(screen.getByText('Sin sesiones hoy.')).toBeInTheDocument()
  })

  it('muestra el estado de error', () => {
    render(<SessionList sessions={[]} role="trainer" error="No se pudieron cargar." />)

    expect(screen.getByText('No se pudieron cargar.')).toBeInTheDocument()
  })

  it('pasa el id de la sesión a onAction', async () => {
    const onAction = vi.fn()
    render(<SessionList sessions={sessions} role="trainer" onAction={onAction} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Ver inscritos' })[1])

    expect(onAction).toHaveBeenCalledWith(2)
  })
})
