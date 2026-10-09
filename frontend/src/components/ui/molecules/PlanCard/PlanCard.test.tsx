import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlanCard } from '@/components/ui/molecules/PlanCard'

describe('PlanCard', () => {
  it('muestra el nombre, el precio y la duración', () => {
    render(<PlanCard name="Mensual" priceCents={3999} durationDays={30} />)

    expect(screen.getByRole('heading', { name: 'Mensual' })).toBeInTheDocument()
    expect(screen.getByText('39,99 €')).toBeInTheDocument()
    expect(screen.getByText('Cada 30 días')).toBeInTheDocument()
  })

  it('lista las ventajas y las acciones', () => {
    render(
      <PlanCard name="Premium" priceCents={5999} durationDays={30} features={['Clases', 'Sauna']}>
        <a href="/register">Hazte socio</a>
      </PlanCard>,
    )

    expect(screen.getByText('· Clases')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hazte socio' })).toBeInTheDocument()
  })
})
