import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('wires the label to the input, so clicking the label focuses the field', async () => {
    render(<FormField label="Correo electrónico" placeholder="ana@ejemplo.com" />)
    const input = screen.getByPlaceholderText('ana@ejemplo.com')
    await userEvent.click(screen.getByText('Correo electrónico'))
    expect(input).toHaveFocus()
  })

  it('forwards the native input props', () => {
    render(<FormField label="Email" type="email" name="email" required placeholder="x" />)
    const input = screen.getByPlaceholderText('x')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toBeRequired()
  })

  it('shows the helper text and describes the input with it', () => {
    render(<FormField label="Email" helperText="Mínimo 8 caracteres" placeholder="x" />)
    const input = screen.getByPlaceholderText('x')
    const helper = screen.getByText('Mínimo 8 caracteres')
    expect(helper).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', helper.id)
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('shows the error, marks the field invalid and points aria-describedby at it', () => {
    render(<FormField label="Email" error="Correo ya registrado" placeholder="x" />)
    const input = screen.getByPlaceholderText('x')
    const error = screen.getByText('Correo ya registrado')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('border-danger')
    expect(input).toHaveAttribute('aria-describedby', error.id)
  })

  it('prefers the error over the helper text', () => {
    render(<FormField label="Email" helperText="Ayuda" error="Fallo" placeholder="x" />)
    expect(screen.getByText('Fallo')).toBeInTheDocument()
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument()
  })

  it('forwards the ref and Input props such as leftIcon', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <FormField ref={ref} label="Email" leftIcon="search" placeholder="x" />,
    )
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
