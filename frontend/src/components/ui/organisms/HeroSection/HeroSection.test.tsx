import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroSection } from '@/components/ui/organisms/HeroSection'

describe('HeroSection', () => {
  it('muestra el lema, el subtítulo y las acciones', () => {
    render(
      <HeroSection
        title="Entrena a tu ritmo"
        subtitle="Clases y planes flexibles."
        actions={<a href="/register">Hazte socio</a>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Entrena a tu ritmo' })).toBeInTheDocument()
    expect(screen.getByText('Clases y planes flexibles.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hazte socio' })).toBeInTheDocument()
  })
})
