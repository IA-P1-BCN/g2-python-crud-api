import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MembershipCard } from '@/components/ui/molecules/MembershipCard'

describe('MembershipCard', () => {
  it('muestra el plan, el estado, la fecha y los días restantes', () => {
    render(
      <MembershipCard
        planName="Mensual"
        status="active"
        endDate="31/10/2026"
        daysLeft={12}
        totalDays={30}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Mensual' })).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByText('Termina el 31/10/2026')).toBeInTheDocument()
    expect(screen.getByText('12 días restantes')).toBeInTheDocument()
  })

  it('refleja los días restantes en el progreso', () => {
    render(
      <MembershipCard
        planName="Mensual"
        status="active"
        endDate="31/10/2026"
        daysLeft={12}
        totalDays={30}
      />,
    )

    const progress = screen.getByRole('progressbar', { name: 'Días restantes' })
    expect(progress).toHaveAttribute('aria-valuenow', '12')
    expect(progress).toHaveAttribute('aria-valuemax', '30')
  })

  it('muestra el estado caducada', () => {
    render(
      <MembershipCard
        planName="Mensual"
        status="expired"
        endDate="01/10/2026"
        daysLeft={0}
        totalDays={30}
      />,
    )

    expect(screen.getByText('Caducada')).toBeInTheDocument()
  })
})
