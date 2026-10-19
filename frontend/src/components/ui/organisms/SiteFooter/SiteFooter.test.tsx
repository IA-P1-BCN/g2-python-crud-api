import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('muestra el copyright con el año actual', () => {
    render(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(`${new Date().getFullYear()} Athletica`)
    expect(footer).toHaveTextContent('Todos los derechos reservados.')
  })

  it('permite fijar el año', () => {
    render(<SiteFooter year={2025} />)

    expect(screen.getByRole('contentinfo')).toHaveTextContent('2025 Athletica')
  })

  it('acepta una clase extra', () => {
    render(<SiteFooter className="border-t border-line" />)

    expect(screen.getByRole('contentinfo')).toHaveClass('border-t')
  })
})
