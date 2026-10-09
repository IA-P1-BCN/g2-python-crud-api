import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlansSection, type PlanSummary } from '@/components/ui/organisms/PlansSection'

const plan: PlanSummary = {
  id: 1,
  name: 'Mensual',
  priceCents: 3999,
  durationDays: 30,
  description: null,
}

describe('PlansSection', () => {
  it('lista los planes', () => {
    render(<PlansSection plans={[plan]} renderAction={() => <a href="/register">Hazte socio</a>} />)

    expect(screen.getByRole('heading', { name: 'Planes' })).toBeInTheDocument()
    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText('39,99 €')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hazte socio' })).toBeInTheDocument()
  })

  it('muestra el estado vacío', () => {
    render(<PlansSection plans={[]} />)

    expect(screen.getByText('No hay planes disponibles por el momento.')).toBeInTheDocument()
  })
})
