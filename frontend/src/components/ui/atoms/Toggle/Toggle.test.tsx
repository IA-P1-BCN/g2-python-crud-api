import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from '@/components/ui/atoms/Toggle'

describe('Toggle', () => {
  it('es un switch accesible con aria-checked', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Activo" />)

    expect(screen.getByRole('switch', { name: 'Activo' })).toHaveAttribute('aria-checked', 'false')
  })

  it('alterna e informa del nuevo valor', async () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Activo" />)

    await userEvent.click(screen.getByRole('switch', { name: 'Activo' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('refleja el estado marcado y deshabilitado', () => {
    render(<Toggle checked onChange={() => {}} label="Activo" disabled />)

    const toggle = screen.getByRole('switch', { name: 'Activo' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(toggle).toBeDisabled()
  })
})
