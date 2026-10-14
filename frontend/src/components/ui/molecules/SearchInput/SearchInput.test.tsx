import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('debounces the callback by 300ms and trims the value', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder="Buscar socio…" />)
    const input = screen.getByPlaceholderText('Buscar socio…')

    fireEvent.change(input, { target: { value: '  ana  ' } })
    expect(onSearch).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('ana')
  })

  it('does not fire on mount', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder="q" />)

    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('clears the field and searches again with an empty value', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder="q" />)
    const input = screen.getByPlaceholderText('q')

    fireEvent.change(input, { target: { value: 'marc' } })
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).toHaveBeenLastCalledWith('marc')

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(input).toHaveValue('')

    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).toHaveBeenLastCalledWith('')
  })
})
