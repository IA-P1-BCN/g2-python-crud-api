import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('uses up to two words', () => {
    expect(getInitials('sofía navarro')).toBe('SN')
    expect(getInitials('Marcos Valle Ruiz')).toBe('MV')
    expect(getInitials('  Ana  ')).toBe('A')
    expect(getInitials('')).toBe('')
  })
})

describe('Avatar', () => {
  it('shows the photo with the name as alt text', () => {
    render(<Avatar src="/sofia.png" name="Sofía Navarro" />)
    expect(screen.getByRole('img', { name: 'Sofía Navarro' })).toHaveAttribute('src', '/sofia.png')
  })

  it('falls back to initials without photo', () => {
    render(<Avatar name="Sofía Navarro" />)
    expect(screen.getByRole('img', { name: 'Sofía Navarro' })).toHaveTextContent('SN')
  })

  it('falls back to initials when the photo fails to load', () => {
    render(<Avatar src="/roto.png" name="Marcos Valle" />)
    fireEvent.error(screen.getByRole('img', { name: 'Marcos Valle' }))
    expect(screen.getByRole('img', { name: 'Marcos Valle' })).toHaveTextContent('MV')
  })

  it('has three sizes', () => {
    const { container, rerender } = render(<Avatar name="Ana Ruiz" />)
    expect(container.querySelector('.size-10')).toBeInTheDocument()
    rerender(<Avatar name="Ana Ruiz" size="sm" />)
    expect(container.querySelector('.size-8')).toBeInTheDocument()
    rerender(<Avatar name="Ana Ruiz" size="lg" />)
    expect(container.querySelector('.size-14')).toBeInTheDocument()
  })

  it('shows the verified check or the online dot', () => {
    const { rerender } = render(<Avatar name="Ana Ruiz" />)
    expect(screen.queryByTestId('avatar-status')).toBeNull()

    rerender(<Avatar name="Ana Ruiz" status="verified" />)
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-primary')
    expect(screen.getByTestId('avatar-status').querySelector('svg')).toBeInTheDocument()

    rerender(<Avatar name="Ana Ruiz" status="online" />)
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-success')
  })
})
