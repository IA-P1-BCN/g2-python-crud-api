import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DayChip } from '@/components/ui/molecules/DayChip'

describe('DayChip', () => {
  it('muestra la abreviatura del día y el número', () => {
    render(<DayChip day="Lun" date={6} />)

    expect(screen.getByRole('button', { name: 'Lun 6' })).toBeInTheDocument()
    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('marca el estado seleccionado en lima', () => {
    render(<DayChip day="Lun" date={6} isSelected />)

    const chip = screen.getByRole('button', { name: 'Lun 6' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveClass('day-chip--selected')
  })

  it('no marca el estado seleccionado por defecto', () => {
    render(<DayChip day="Lun" date={6} />)

    const chip = screen.getByRole('button', { name: 'Lun 6' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    expect(chip).not.toHaveClass('day-chip--selected')
  })

  it('muestra el marcador cuando el día tiene sesiones', () => {
    const { container } = render(<DayChip day="Lun" date={6} hasSessions />)

    expect(screen.getByRole('button', { name: 'Lun 6, con sesiones' })).toBeInTheDocument()
    expect(container.querySelector('.day-chip__marker')).not.toBeNull()
  })

  it('no muestra el marcador cuando el día no tiene sesiones', () => {
    const { container } = render(<DayChip day="Lun" date={6} />)

    expect(container.querySelector('.day-chip__marker')).toBeNull()
  })

  it('llama a onClick al pulsarlo', async () => {
    const onClick = vi.fn()
    render(<DayChip day="Lun" date={6} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Lun 6' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
