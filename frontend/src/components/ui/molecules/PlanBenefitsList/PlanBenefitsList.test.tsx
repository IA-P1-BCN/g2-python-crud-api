import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlanBenefitsList } from '@/components/ui/molecules/PlanBenefitsList'
import { PLAN_BENEFITS } from '@/lib/plan-benefits'

describe('PlanBenefitsList', () => {
  it('lista los beneficios por defecto con su título', () => {
    render(<PlanBenefitsList />)

    expect(screen.getByRole('heading', { name: 'Incluye' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(PLAN_BENEFITS.length)
    expect(screen.getByText('Acceso a todas las clases dirigidas')).toBeInTheDocument()
  })

  it('lista los beneficios que se le pasan', () => {
    render(
      <PlanBenefitsList
        title="Tu plan incluye"
        items={[
          { icon: 'ticket', label: 'Acceso a la sauna' },
          { icon: 'users', label: 'Clases en grupo' },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Tu plan incluye' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Acceso a la sauna')).toBeInTheDocument()
    expect(screen.getByText('Clases en grupo')).toBeInTheDocument()
  })
})
