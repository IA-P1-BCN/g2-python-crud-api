import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('deshabilita "Anterior" en la primera página', () => {
    render(<Pagination page={1} pages={3} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('deshabilita "Siguiente" en la última página', () => {
    render(<Pagination page={3} pages={3} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('llama a onChange con la página siguiente', async () => {
    const onChange = vi.fn()
    render(<Pagination page={1} pages={3} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(onChange).toHaveBeenCalledWith(2)
  })
})
