import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeaturedClassCard } from '@/components/ui/molecules/FeaturedClassCard'

describe('FeaturedClassCard', () => {
  it('muestra la clase, el horario y las plazas', () => {
    render(<FeaturedClassCard name="Yoga" schedule="Lunes 10:00 – 11:00" capacity={20} />)

    expect(screen.getByRole('heading', { name: 'Yoga' })).toBeInTheDocument()
    expect(screen.getByText('Lunes 10:00 – 11:00')).toBeInTheDocument()
    expect(screen.getByText('20 plazas')).toBeInTheDocument()
  })

  it('muestra el entrenador cuando se conoce', () => {
    render(
      <FeaturedClassCard
        name="Yoga"
        schedule="Lunes 10:00 – 11:00"
        capacity={20}
        trainerName="Ana López"
      />,
    )

    expect(screen.getByText('Ana López')).toBeInTheDocument()
  })
})
