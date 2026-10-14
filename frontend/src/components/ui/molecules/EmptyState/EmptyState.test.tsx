import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title and the hint', () => {
    render(<EmptyState title="No hay socios" hint="Crea el primero para empezar." />)
    expect(screen.getByText('No hay socios')).toBeInTheDocument()
    expect(screen.getByText('Crea el primero para empezar.')).toBeInTheDocument()
  })

  it('renders the icon only when given', () => {
    const { container, rerender } = render(<EmptyState title="Vacío" />)
    expect(container.querySelector('svg')).toBeNull()
    rerender(<EmptyState icon="search" title="Vacío" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the optional action', () => {
    render(<EmptyState title="Vacío" action={<button type="button">Crear</button>} />)
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })
})
