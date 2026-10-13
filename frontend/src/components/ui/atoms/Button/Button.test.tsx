import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { buttonStyles } from './buttonStyles'

describe('Button', () => {
  it('renders primary and md by default', () => {
    render(<Button>Guardar</Button>)
    const button = screen.getByRole('button', { name: 'Guardar' })
    expect(button).toHaveClass('bg-primary', 'text-ink', 'h-11', 'md:h-10', 'rounded-full')
  })

  it.each([
    ['secondary', 'bg-surface-sunken'],
    ['tertiary', 'bg-scrim'],
    ['white', 'bg-white'],
    ['danger', 'text-danger'],
    ['ghost', 'text-text-soft'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Acción</Button>)
    expect(screen.getByRole('button')).toHaveClass(expectedClass)
  })

  it('has mobile and desktop heights per size', () => {
    const { rerender } = render(<Button size="sm">A</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'md:h-9')
    rerender(<Button size="lg">A</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-13', 'md:h-12')
  })

  it('can take the full width', () => {
    render(<Button fullWidth>Entrar</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('renders icons before and after the label', () => {
    const { container } = render(
      <Button leftIcon="plus" rightIcon="chevron-right">
        Nuevo
      </Button>,
    )
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })

  it('calls onClick and respects disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Pulsar</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Pulsar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows the loading state and disables the button', () => {
    render(<Button isLoading>Guardar</Button>)
    const button = screen.getByRole('button', { name: 'Cargando…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('merges a custom className', () => {
    render(<Button className="mt-4 h-12">Hola</Button>)
    expect(screen.getByRole('button')).toHaveClass('mt-4', 'h-12')
    expect(screen.getByRole('button')).not.toHaveClass('h-11')
  })

  it('exposes the same classes for links', () => {
    expect(buttonStyles({ variant: 'secondary', size: 'sm' })).toContain('bg-surface-sunken')
    expect(buttonStyles()).toContain('bg-primary')
  })
})
