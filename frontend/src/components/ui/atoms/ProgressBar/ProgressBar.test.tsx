import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '@/components/ui/atoms/ProgressBar'

describe('ProgressBar', () => {
  it('expone value y max con aria-valuenow', () => {
    render(<ProgressBar value={30} max={60} label="Progreso" />)

    const bar = screen.getByRole('progressbar', { name: 'Progreso' })
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '60')
  })

  it('recorta el valor al rango 0..max', () => {
    render(<ProgressBar value={150} max={100} label="Progreso" />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('aplica la variante en el relleno', () => {
    const { container } = render(<ProgressBar value={50} variant="secondary-soft" />)

    expect(container.querySelector('.bg-secondary-soft')).not.toBeNull()
  })
})
