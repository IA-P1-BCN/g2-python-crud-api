import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileGreeting } from '@/components/ui/molecules/ProfileGreeting'

describe('ProfileGreeting', () => {
  it('muestra el saludo, el avatar y el subtítulo', () => {
    render(<ProfileGreeting name="Socio Uno" subtitle="Plan Mensual" />)

    expect(screen.getByRole('heading', { name: 'Hola, Socio Uno' })).toBeInTheDocument()
    expect(screen.getByText('Plan Mensual')).toBeInTheDocument()
    expect(screen.getByText('SU')).toBeInTheDocument()
  })

  it('omite el subtítulo cuando es null', () => {
    render(<ProfileGreeting name="Socio Uno" subtitle={null} />)

    expect(screen.queryByText('Plan Mensual')).not.toBeInTheDocument()
  })

  it('permite otro saludo', () => {
    render(<ProfileGreeting name="Ana" greeting="Buenos días" />)

    expect(screen.getByRole('heading', { name: 'Buenos días, Ana' })).toBeInTheDocument()
  })
})
