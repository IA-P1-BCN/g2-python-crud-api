import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlansDistributionChart } from '@/components/ui/organisms/PlansDistributionChart'
import type { PlanShare } from '@/types/api'

const plans: PlanShare[] = [
  { plan_id: 1, name: 'Mensual', price_cents: 3000, members: 2, share: 0.67 },
  { plan_id: 2, name: 'Anual', price_cents: 30000, members: 1, share: 0.33 },
]

describe('PlansDistributionChart', () => {
  it('muestra un segmento del donut por plan y su leyenda', () => {
    render(<PlansDistributionChart plans={plans} />)

    expect(screen.getByRole('heading', { name: 'Planes más contratados' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Reparto de 3 membresías' })).toBeInTheDocument()
    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText('2 · 67 %')).toBeInTheDocument()
  })

  it('avisa cuando no hay membresías', () => {
    render(<PlansDistributionChart plans={[]} />)

    expect(screen.getByText('No hay membresías en vigor.')).toBeInTheDocument()
  })
})
