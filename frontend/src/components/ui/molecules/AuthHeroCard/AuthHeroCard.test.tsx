import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthHeroCard } from '@/components/ui/molecules/AuthHeroCard'

describe('AuthHeroCard', () => {
  it('muestra el eslogan y el subtítulo en la tarjeta azul', () => {
    const { container } = render(
      <AuthHeroCard title="Entrena a tu ritmo" subtitle="Clases dirigidas y reserva online." />,
    )

    expect(screen.getByRole('heading', { name: 'Entrena a tu ritmo' })).toBeInTheDocument()
    expect(screen.getByText('Clases dirigidas y reserva online.')).toBeInTheDocument()
    expect(container.querySelector('.bg-secondary')).not.toBeNull()
  })

  it('muestra la insignia cuando se le pasa', () => {
    render(<AuthHeroCard title="Entrena" subtitle="Sub" badge="Athletica" />)

    expect(screen.getByText('Athletica')).toBeInTheDocument()
  })
})
