import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SessionHero } from '@/components/ui/molecules/SessionHero'

describe('SessionHero', () => {
  it('muestra clase, entrenador, sala, horario y plazas', () => {
    render(
      <SessionHero
        title="Yoga"
        date="06/10/2026"
        time="10:00 – 11:00"
        trainerName="Ana López"
        room="Sala 1"
        enrolled={12}
        capacity={20}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Yoga' })).toBeInTheDocument()
    expect(screen.getByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('06/10/2026 · 10:00 – 11:00 · Sala 1')).toBeInTheDocument()
    expect(screen.getByText('12 de 20 plazas · 8 libres')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Ocupación de la sesión' })).toHaveAttribute(
      'aria-valuenow',
      '12',
    )
  })
})
