import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnrolledMemberRow } from '@/components/molecules/EnrolledMemberRow'

describe('EnrolledMemberRow', () => {
  it('muestra el avatar, el nombre, el número de socio y la hora', () => {
    render(<EnrolledMemberRow name="Socio Uno" memberNumber={7} time="09:15" />)

    expect(screen.getByText('SU')).toBeInTheDocument()
    expect(screen.getByText('Socio Uno')).toBeInTheDocument()
    expect(screen.getByText('Socio #7')).toBeInTheDocument()
    expect(screen.getByText('09:15')).toBeInTheDocument()
  })

  it('usa las iniciales de las dos primeras palabras', () => {
    render(<EnrolledMemberRow name="Ana María López" memberNumber={1} time="10:00" />)

    expect(screen.getByText('AM')).toBeInTheDocument()
  })
})
