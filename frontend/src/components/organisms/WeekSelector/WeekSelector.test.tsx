import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WeekSelector } from '@/components/organisms/WeekSelector'

// Thursday 8 October 2026 → week from Monday 5 to Sunday 11 October.
const SELECTED = '2026-10-08'

describe('WeekSelector', () => {
  it('muestra los siete días de la semana y el rango', () => {
    render(<WeekSelector selectedDate={SELECTED} onSelectDate={() => {}} />)

    expect(screen.getByText('05/10/2026 – 11/10/2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lun 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jue 8' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dom 11' })).toBeInTheDocument()
  })

  it('marca solo el día seleccionado', () => {
    render(<WeekSelector selectedDate={SELECTED} onSelectDate={() => {}} />)

    expect(screen.getByRole('button', { name: 'Jue 8' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Lun 5' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('llama a onSelectDate con la fecha del día pulsado', async () => {
    const onSelectDate = vi.fn()
    render(<WeekSelector selectedDate={SELECTED} onSelectDate={onSelectDate} />)

    await userEvent.click(screen.getByRole('button', { name: 'Mar 6' }))

    expect(onSelectDate).toHaveBeenCalledWith('2026-10-06')
  })

  it('las flechas mueven la semana', async () => {
    const onSelectDate = vi.fn()
    render(<WeekSelector selectedDate={SELECTED} onSelectDate={onSelectDate} />)

    await userEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }))
    expect(onSelectDate).toHaveBeenLastCalledWith('2026-10-15')

    await userEvent.click(screen.getByRole('button', { name: 'Semana anterior' }))
    expect(onSelectDate).toHaveBeenLastCalledWith('2026-10-01')
  })

  it('marca los días que tienen sesiones', () => {
    render(
      <WeekSelector
        selectedDate={SELECTED}
        onSelectDate={() => {}}
        sessionDates={['2026-10-07']}
      />,
    )

    expect(screen.getByRole('button', { name: 'Mié 7, con sesiones' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jue 8' })).toBeInTheDocument()
  })
})
