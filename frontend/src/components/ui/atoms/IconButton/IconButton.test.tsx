import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('uses the label as accessible name and is type="button"', () => {
    render(<IconButton icon="search" label="Buscar" />)
    const button = screen.getByRole('button', { name: 'Buscar' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('has mobile and desktop sizes', () => {
    const { rerender } = render(<IconButton icon="x" label="Cerrar" />)
    expect(screen.getByRole('button')).toHaveClass('size-11', 'md:size-10', 'rounded-full')
    rerender(<IconButton icon="x" label="Cerrar" size="lg" />)
    expect(screen.getByRole('button')).toHaveClass('size-12', 'md:size-11')
    rerender(<IconButton icon="x" label="Cerrar" size="sm" />)
    expect(screen.getByRole('button')).toHaveClass('size-8')
  })

  it.each([
    ['surface', 'bg-surface'],
    ['primary', 'bg-primary'],
    ['ghost', 'text-text-soft'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<IconButton icon="plus" label="Añadir" variant={variant} />)
    expect(screen.getByRole('button')).toHaveClass(expectedClass)
  })

  it('calls onClick and respects disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<IconButton icon="plus" label="Añadir" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(<IconButton icon="plus" label="Añadir" onClick={onClick} disabled />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
