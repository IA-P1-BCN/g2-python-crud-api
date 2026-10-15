import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BookingsByDayChart } from '@/components/ui/organisms/BookingsByDayChart'
import type { DailyBookings } from '@/types/api'

const days: DailyBookings[] = [
  { day: '2026-10-05', count: 1 },
  { day: '2026-10-06', count: 3 },
  { day: '2026-10-07', count: 2 },
]

describe('BookingsByDayChart', () => {
  it('pinta una barra por día y titula la tarjeta', () => {
    render(<BookingsByDayChart days={days} />)

    expect(screen.getByRole('heading', { name: 'Reservas por día' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(days.length)
  })

  it('destaca el pico y avisa cuando no hay datos', () => {
    const { container, rerender } = render(<BookingsByDayChart days={days} />)
    expect(container.querySelectorAll('.bg-primary')).toHaveLength(1)

    rerender(<BookingsByDayChart days={[]} />)
    expect(screen.getByText('Sin reservas en este periodo.')).toBeInTheDocument()
  })
})
