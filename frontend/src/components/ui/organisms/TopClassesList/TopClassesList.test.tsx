import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopClassesList } from '@/components/ui/organisms/TopClassesList'
import type { PopularClass } from '@/types/api'

const classes: PopularClass[] = [
  { class_id: 1, name: 'Spinning', bookings: 46 },
  { class_id: 2, name: 'Yoga', bookings: 30 },
]

describe('TopClassesList', () => {
  it('ordena las clases con su número de reservas', () => {
    render(<TopClassesList classes={classes} />)

    expect(screen.getByRole('heading', { name: 'Clases más populares' })).toBeInTheDocument()
    expect(screen.getByText('Spinning')).toBeInTheDocument()
    expect(screen.getByText('46')).toBeInTheDocument()
  })

  it('avisa cuando no hay reservas', () => {
    render(<TopClassesList classes={[]} />)

    expect(screen.getByText('No hay reservas en este periodo.')).toBeInTheDocument()
  })
})
