import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeatureItem } from '@/components/ui/molecules/FeatureItem'

describe('FeatureItem', () => {
  it('muestra el título y el texto', () => {
    render(<FeatureItem icon="dumbbell" title="Entrena a tu ritmo" text="Clases para todos." />)

    expect(screen.getByRole('heading', { name: 'Entrena a tu ritmo' })).toBeInTheDocument()
    expect(screen.getByText('Clases para todos.')).toBeInTheDocument()
  })
})
