import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders neutral by default', () => {
    render(<Badge>Inactivo</Badge>)
    expect(screen.getByText('Inactivo')).toHaveClass('bg-line', 'text-text-soft', 'rounded-full')
  })

  it.each([
    ['primary', 'text-primary'],
    ['secondary', 'bg-secondary-mid'],
    ['info', 'text-secondary-soft'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
    ['danger', 'text-danger'],
  ] as const)('applies the %s tone', (tone, expectedClass) => {
    render(<Badge tone={tone}>Estado</Badge>)
    expect(screen.getByText('Estado')).toHaveClass(expectedClass)
  })

  it('can show a status dot', () => {
    const { container } = render(<Badge dot>En curso</Badge>)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('size-2', 'rounded-full')
  })

  it('has no dot by default and is not uppercase', () => {
    const { container } = render(<Badge>Activo</Badge>)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(screen.getByText('Activo')).not.toHaveClass('uppercase')
  })

  it('can be uppercase and take extra classes', () => {
    render(
      <Badge uppercase className="ml-2">
        Plan anual
      </Badge>,
    )
    expect(screen.getByText('Plan anual')).toHaveClass('uppercase', 'tracking-wide', 'ml-2')
  })
})
