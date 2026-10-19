import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table, type Column } from './Table'

type Row = { id: number; name: string; role: string }

const columns: Column<Row>[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'role', header: 'Rol' },
]

const rows: Row[] = [
  { id: 1, name: 'Ana', role: 'admin' },
  { id: 2, name: 'Marc', role: 'member' },
]

describe('Table', () => {
  it('renders the column headers', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.id} />)
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rol' })).toBeInTheDocument()
  })

  it('renders a row per item with the cell values', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.id} />)
    // One header row plus one row per item.
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('member')).toBeInTheDocument()
  })

  it('uses the custom render when provided', () => {
    const withRender: Column<Row>[] = [
      ...columns,
      { key: 'badge', header: 'Badge', render: (row) => <span>{row.name}!</span> },
    ]
    render(<Table columns={withRender} rows={rows} rowKey={(row) => row.id} />)
    expect(screen.getByText('Ana!')).toBeInTheDocument()
  })

  it('shows the loading message while loading', () => {
    render(<Table columns={columns} rows={[]} rowKey={() => 0} isLoading />)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('shows the empty message when there are no rows', () => {
    render(<Table columns={columns} rows={[]} rowKey={() => 0} emptyMessage="Sin datos" />)
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
  })
})
