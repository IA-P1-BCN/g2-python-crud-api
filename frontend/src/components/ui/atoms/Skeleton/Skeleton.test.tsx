import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '@/components/ui/atoms/Skeleton'

describe('Skeleton', () => {
  it('es decorativo y animado por defecto', () => {
    const { container } = render(<Skeleton />)
    const block = container.firstElementChild as HTMLElement

    expect(block).toHaveAttribute('aria-hidden', 'true')
    expect(block.className).toContain('animate-pulse')
    expect(block.className).toContain('bg-surface-sunken')
  })

  it('acepta tamaño y forma por className', () => {
    const { container } = render(<Skeleton className="h-8 w-40 rounded-full" />)
    const block = container.firstElementChild as HTMLElement

    expect(block.className).toContain('h-8')
    expect(block.className).toContain('w-40')
    expect(block.className).toContain('rounded-full')
  })
})
