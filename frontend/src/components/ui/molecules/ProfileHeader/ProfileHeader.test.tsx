import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileHeader } from '@/components/ui/molecules/ProfileHeader'

describe('ProfileHeader', () => {
  it('muestra el avatar, el nombre y el rol', () => {
    render(<ProfileHeader name="Entrenador Uno" role="trainer" />)

    expect(screen.getByRole('heading', { name: 'Entrenador Uno' })).toBeInTheDocument()
    expect(screen.getByText('Entrenador')).toBeInTheDocument()
    expect(screen.getByText('EU')).toBeInTheDocument()
  })
})
