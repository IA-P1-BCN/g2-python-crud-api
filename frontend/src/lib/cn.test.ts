import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('concatenates class names', () => {
    expect(cn('p-2', 'text-text')).toBe('p-2 text-text')
  })

  it('resolves tailwind conflicts, the last value wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignores falsy values and flattens arrays', () => {
    const isActive: boolean = false
    expect(cn('p-2', isActive && 'hidden', ['m-1'])).toBe('p-2 m-1')
  })
})
