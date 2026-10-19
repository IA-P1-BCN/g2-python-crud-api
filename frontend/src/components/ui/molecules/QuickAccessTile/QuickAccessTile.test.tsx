import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QuickAccessTile } from '@/components/ui/molecules/QuickAccessTile'

describe('QuickAccessTile', () => {
  it('enlaza a la ruta con su etiqueta', () => {
    render(
      <MemoryRouter>
        <QuickAccessTile icon="calendar" label="Reservas" to="/member/bookings" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Reservas' })).toHaveAttribute(
      'href',
      '/member/bookings',
    )
  })
})
