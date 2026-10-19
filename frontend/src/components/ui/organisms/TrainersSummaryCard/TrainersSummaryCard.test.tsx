import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrainersSummaryCard } from '@/components/ui/organisms/TrainersSummaryCard'

describe('TrainersSummaryCard', () => {
  it('lista los entrenadores con sus sesiones y el total de activos', () => {
    render(
      <TrainersSummaryCard
        trainers={[
          { id: 2, name: 'Entrenador Uno', sessions: 3 },
          { id: 3, name: 'Entrenador Dos', sessions: 1 },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Entrenadores' })).toBeInTheDocument()
    expect(screen.getByText('2 activos')).toBeInTheDocument()
    expect(screen.getByText('Entrenador Uno')).toBeInTheDocument()
    expect(screen.getByText('3 sesiones')).toBeInTheDocument()
    expect(screen.getByText('1 sesión')).toBeInTheDocument()
  })

  it('avisa cuando no hay entrenadores activos', () => {
    render(<TrainersSummaryCard trainers={[]} />)

    expect(screen.getByText('No hay entrenadores activos.')).toBeInTheDocument()
  })

  it('muestra el error y el estado de carga', () => {
    const { rerender } = render(<TrainersSummaryCard trainers={[]} error="boom" />)
    expect(screen.getByRole('alert')).toHaveTextContent('boom')

    rerender(<TrainersSummaryCard trainers={[]} isLoading />)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })
})
