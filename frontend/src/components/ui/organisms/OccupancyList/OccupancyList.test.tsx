import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OccupancyList } from '@/components/ui/organisms/OccupancyList'
import type { ClassOccupancy } from '@/types/api'

const classes: ClassOccupancy[] = [
  { class_id: 1, name: 'Spinning', booked: 46, capacity: 50, rate: 0.92 },
]

describe('OccupancyList', () => {
  it('muestra la ocupación por clase y la media', () => {
    render(<OccupancyList averageRate={0.71} classes={classes} />)

    expect(screen.getByRole('heading', { name: 'Ocupación de clases' })).toBeInTheDocument()
    expect(screen.getByText('71 %')).toBeInTheDocument()
    expect(screen.getByText('Spinning')).toBeInTheDocument()
    expect(screen.getByText('46 / 50')).toBeInTheDocument()
    expect(screen.getByText('92 %')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Ocupación de Spinning' })).toBeInTheDocument()
  })

  it('avisa cuando no hay sesiones', () => {
    render(<OccupancyList averageRate={0} classes={[]} />)

    expect(screen.getByText('No hay sesiones en este periodo.')).toBeInTheDocument()
  })
})
