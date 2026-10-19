import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateRangeFilter } from '@/components/ui/molecules/DateRangeFilter'

describe('DateRangeFilter', () => {
  it('marca la opción activa con aria-pressed', () => {
    render(<DateRangeFilter value="7d" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '7 días' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Hoy' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('avisa del periodo elegido', async () => {
    const onChange = vi.fn()
    render(<DateRangeFilter value="7d" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '30 días' }))

    expect(onChange).toHaveBeenCalledWith('30d')
  })
})
