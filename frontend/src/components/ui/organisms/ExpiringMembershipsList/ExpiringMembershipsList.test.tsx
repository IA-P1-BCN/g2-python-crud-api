import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExpiringMembershipsList } from '@/components/ui/organisms/ExpiringMembershipsList'
import type { ExpiringMembership } from '@/types/api'

const memberships: ExpiringMembership[] = [
  {
    membership_id: 7,
    user_id: 3,
    full_name: 'Elena Ramos',
    plan_name: 'Plan Anual',
    end_date: '2026-10-09',
    days_left: 2,
  },
]

describe('ExpiringMembershipsList', () => {
  it('lista los socios con los días que quedan', () => {
    render(<ExpiringMembershipsList memberships={memberships} />)

    expect(
      screen.getByRole('heading', { name: 'Membresías que vencen en 7 días' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Elena Ramos')).toBeInTheDocument()
    expect(screen.getByText(/Plan Anual/)).toBeInTheDocument()
    expect(screen.getByText('2 días')).toBeInTheDocument()
  })

  it('avisa cuando no vence ninguna', () => {
    render(<ExpiringMembershipsList memberships={[]} />)

    expect(screen.getByText('Ninguna membresía vence en los próximos 7 días.')).toBeInTheDocument()
  })
})
