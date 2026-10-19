import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QuickAccessGrid } from '@/components/ui/organisms/QuickAccessGrid'

describe('QuickAccessGrid', () => {
  it('muestra un acceso por elemento', () => {
    render(
      <MemoryRouter>
        <QuickAccessGrid
          items={[
            { icon: 'calendar', label: 'Reservas', to: '/member/bookings' },
            { icon: 'dumbbell', label: 'Mi plan', to: '/member/membership' },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Reservas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi plan' })).toBeInTheDocument()
  })
})
