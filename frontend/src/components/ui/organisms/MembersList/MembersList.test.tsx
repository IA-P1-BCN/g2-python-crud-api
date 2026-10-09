import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MembersList, type MemberListEntry } from '@/components/organisms/MembersList'

const members: MemberListEntry[] = [
  {
    id: 1,
    name: 'Ana',
    email: 'ana@test.dev',
    planName: 'Mensual',
    membershipStatus: 'active',
    lastPayment: { amountCents: 1000, date: '2026-10-01', status: 'paid' },
  },
  {
    id: 2,
    name: 'Bea',
    email: 'bea@test.dev',
    planName: null,
    membershipStatus: null,
    lastPayment: null,
  },
]

describe('MembersList', () => {
  it('renderiza una fila por socio', () => {
    render(<MembersList members={members} />)

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Bea')).toBeInTheDocument()
  })

  it('envía la búsqueda al enviar el formulario', async () => {
    const onSearch = vi.fn()
    render(<MembersList members={members} onSearch={onSearch} />)

    await userEvent.type(screen.getByLabelText('Buscar por nombre'), 'ana')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onSearch).toHaveBeenCalledWith('ana')
  })

  it('muestra el paginador y cambia de página', async () => {
    const onPageChange = vi.fn()
    render(<MembersList members={members} page={1} pages={3} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('muestra el estado vacío', () => {
    render(<MembersList members={[]} emptyMessage="Sin socios." />)

    expect(screen.getByText('Sin socios.')).toBeInTheDocument()
  })

  it('muestra el estado de error', () => {
    render(<MembersList members={[]} error="No se pudo cargar." />)

    expect(screen.getByText('No se pudo cargar.')).toBeInTheDocument()
  })

  it('renderiza las acciones de la fila', () => {
    render(
      <MembersList members={members} renderActions={(member) => <button>{member.name}</button>} />,
    )

    expect(screen.getByRole('button', { name: 'Ana' })).toBeInTheDocument()
  })
})
