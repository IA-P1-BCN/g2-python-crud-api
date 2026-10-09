import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemberListItem } from '@/components/molecules/MemberListItem'

describe('MemberListItem', () => {
  it('muestra nombre, email, plan, membresía y último pago', () => {
    render(
      <MemberListItem
        name="Ana López"
        email="ana@test.dev"
        planName="Mensual"
        membershipStatus="active"
        lastPayment={{ amountCents: 3999, date: '2026-10-01', status: 'paid' }}
      />,
    )

    expect(screen.getByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('ana@test.dev')).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByText('39,99 €')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('indica cuando no hay plan ni pagos', () => {
    render(
      <MemberListItem
        name="Bea Ruiz"
        email="bea@test.dev"
        planName={null}
        membershipStatus={null}
        lastPayment={null}
      />,
    )

    expect(screen.getByText('Sin plan')).toBeInTheDocument()
    expect(screen.getByText('Sin pagos')).toBeInTheDocument()
  })

  it('renderiza las acciones', () => {
    render(
      <MemberListItem
        name="Ana"
        email="ana@test.dev"
        planName={null}
        membershipStatus={null}
        lastPayment={null}
      >
        <button type="button">Ver</button>
      </MemberListItem>,
    )

    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument()
  })
})
