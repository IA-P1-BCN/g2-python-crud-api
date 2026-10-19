import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatCard } from '@/components/ui/molecules/StatCard'

describe('StatCard', () => {
  it('muestra la etiqueta y el número', () => {
    render(<StatCard label="Socios" value={248} />)

    expect(screen.getByText('Socios')).toBeInTheDocument()
    expect(screen.getByText('248')).toBeInTheDocument()
  })

  it('muestra la insignia delta cuando se le pasa', () => {
    render(<StatCard label="Socios" value={248} delta={{ value: '+12', tone: 'success' }} />)

    expect(screen.getByText('+12')).toBeInTheDocument()
  })

  it('muestra la barra de progreso cuando se le pasa', () => {
    render(<StatCard label="Ocupación" value="72%" progress={{ value: 72, max: 100 }} />)

    expect(screen.getByRole('progressbar', { name: 'Ocupación (progreso)' })).toHaveAttribute(
      'aria-valuenow',
      '72',
    )
  })

  it('aplica la variante secundaria', () => {
    const { container } = render(<StatCard label="Socios" value={248} variant="secondary" />)

    expect(container.querySelector('.bg-secondary')).not.toBeNull()
  })
})
