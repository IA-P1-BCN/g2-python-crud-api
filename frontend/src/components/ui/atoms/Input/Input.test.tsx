import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders a pill field and accepts typing', async () => {
    const onChange = vi.fn()
    render(<Input placeholder="Correo electrónico" onChange={onChange} />)
    const input = screen.getByPlaceholderText('Correo electrónico')
    expect(input).toHaveClass('rounded-full', 'bg-surface-sunken', 'pl-4', 'pr-4')
    await userEvent.type(input, 'ana')
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(input).toHaveValue('ana')
  })

  it('forwards the ref and the native attributes', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} type="email" name="email" required />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'email')
    expect(ref.current).toBeRequired()
  })

  it('shows the left icon and leaves room for it', () => {
    const { container } = render(<Input leftIcon="search" aria-label="Buscar" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar')).toHaveClass('pl-11')
  })

  it('renders the right slot and leaves room for it', () => {
    render(<Input aria-label="Contraseña" rightSlot={<button type="button">Ver</button>} />)
    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveClass('pr-12')
  })

  it('marks the invalid state', () => {
    render(<Input aria-label="Email" invalid />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('border-danger')
  })

  it('puts className on the wrapper', () => {
    const { container } = render(<Input aria-label="Email" className="max-w-sm" />)
    expect(container.firstElementChild).toHaveClass('max-w-sm')
  })

  it('can be disabled', () => {
    render(<Input aria-label="Email" disabled />)
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })
})
