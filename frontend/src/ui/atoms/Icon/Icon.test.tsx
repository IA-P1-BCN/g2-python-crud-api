import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders an svg with the default size (20 → size-5)', () => {
    const { container } = render(<Icon name="dumbbell" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('size-5')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('maps the allowed sizes to utility classes', () => {
    const { container } = render(<Icon name="users" size={24} />)
    expect(container.querySelector('svg')).toHaveClass('size-6')
  })

  it('merges extra className', () => {
    const { container } = render(<Icon name="check" size={16} className="text-primary" />)
    expect(container.querySelector('svg')).toHaveClass('size-4', 'text-primary')
  })
})