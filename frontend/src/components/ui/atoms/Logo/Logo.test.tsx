import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from '@/components/ui/atoms/Logo'

describe('Logo', () => {
  it('muestra el nombre por defecto', () => {
    render(<Logo />)

    expect(screen.getByText('Athletica')).toBeInTheDocument()
  })

  it('acepta un nombre propio', () => {
    render(<Logo name="GymFlow" />)

    expect(screen.getByText('GymFlow')).toBeInTheDocument()
  })

  it('muestra el subtítulo de rol cuando se le pasa', () => {
    render(<Logo subtitle="Administrador" />)

    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('no muestra subtítulo cuando es null', () => {
    render(<Logo subtitle={null} />)

    expect(screen.queryByText('Administrador')).not.toBeInTheDocument()
  })
})
