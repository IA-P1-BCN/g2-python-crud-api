import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CapacitySummary } from '@/components/molecules/CapacitySummary'

describe('CapacitySummary', () => {
  it('muestra la ocupación y el porcentaje', () => {
    render(<CapacitySummary enrolled={14} capacity={20} />)

    expect(screen.getByText('14 / 20')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('refleja la ocupación en la barra de progreso', () => {
    render(<CapacitySummary enrolled={14} capacity={20} />)

    const progress = screen.getByRole('progressbar', { name: 'Ocupación' })
    expect(progress).toHaveAttribute('value', '14')
    expect(progress).toHaveAttribute('max', '20')
  })

  it('redondea el porcentaje', () => {
    render(<CapacitySummary enrolled={1} capacity={3} />)

    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('no divide entre cero cuando la capacidad es 0', () => {
    render(<CapacitySummary enrolled={0} capacity={0} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Ocupación' })).toHaveAttribute('max', '1')
  })
})
