import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  EnrolledMembersPanel,
  type EnrolledMember,
} from '@/components/ui/organisms/EnrolledMembersPanel'

const members: EnrolledMember[] = [
  { id: 1, name: 'Socio Uno', memberNumber: 1, time: '09:00' },
  { id: 2, name: 'Ana Gómez', memberNumber: 2, time: '09:15' },
]

function renderPanel(props: Partial<Parameters<typeof EnrolledMembersPanel>[0]> = {}) {
  return render(
    <EnrolledMembersPanel
      title="Yoga"
      date="06/10/2026"
      enrolled={2}
      capacity={20}
      members={members}
      {...props}
    />,
  )
}

describe('EnrolledMembersPanel', () => {
  it('muestra el encabezado, la capacidad y los inscritos', () => {
    renderPanel()

    expect(screen.getByRole('heading', { name: 'Yoga' })).toBeInTheDocument()
    expect(screen.getByText('06/10/2026')).toBeInTheDocument()
    expect(screen.getByText('2 / 20')).toBeInTheDocument()
    expect(screen.getByText('Socio Uno')).toBeInTheDocument()
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
  })

  it('filtra por nombre', async () => {
    renderPanel()

    await userEvent.type(screen.getByLabelText('Buscar miembro'), 'ana')

    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Socio Uno')).not.toBeInTheDocument()
  })

  it('filtra por número de socio', async () => {
    renderPanel()

    await userEvent.type(screen.getByLabelText('Buscar miembro'), '1')

    expect(screen.getByText('Socio Uno')).toBeInTheDocument()
    expect(screen.getByText('Socio #1')).toBeInTheDocument()
  })

  it('muestra el estado vacío', () => {
    renderPanel({ members: [] })

    expect(screen.getByText('No hay miembros inscritos.')).toBeInTheDocument()
  })

  it('muestra el estado de error', () => {
    renderPanel({ error: 'No se pudieron cargar.' })

    expect(screen.getByText('No se pudieron cargar.')).toBeInTheDocument()
  })

  it('llama a onClose al cerrar', async () => {
    const onClose = vi.fn()
    renderPanel({ onClose })

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
