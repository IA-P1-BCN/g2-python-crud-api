import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChartCard } from '@/components/ui/molecules/ChartCard'

describe('ChartCard', () => {
  it('muestra el título, el subtítulo, la insignia y el contenido', () => {
    render(
      <ChartCard title="Reservas por día" subtitle="Últimos 7 días" badge={{ label: 'Peak 12' }}>
        <p>contenido</p>
      </ChartCard>,
    )

    expect(screen.getByRole('heading', { name: 'Reservas por día' })).toBeInTheDocument()
    expect(screen.getByText('Últimos 7 días')).toBeInTheDocument()
    expect(screen.getByText('Peak 12')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('usa la tarjeta azul con la variante secondary', () => {
    const { container } = render(
      <ChartCard title="Ocupación" tone="secondary">
        <p>contenido</p>
      </ChartCard>,
    )

    expect(container.querySelector('.bg-secondary')).not.toBeNull()
  })
})
