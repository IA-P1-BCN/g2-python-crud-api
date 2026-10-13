import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AvatarStack, type AvatarStackPerson } from '@/components/ui/molecules/AvatarStack'

const people: AvatarStackPerson[] = [
  { id: 1, name: 'Ana Uno' },
  { id: 2, name: 'Bea Dos' },
  { id: 3, name: 'Caro Tres' },
  { id: 4, name: 'Dan Cuatro' },
]

describe('AvatarStack', () => {
  it('muestra hasta `max` avatares y el contador +N', () => {
    render(<AvatarStack people={people} max={3} />)

    expect(screen.getByText('AU')).toBeInTheDocument()
    expect(screen.getByText('CT')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.queryByText('DC')).not.toBeInTheDocument()
  })

  it('no muestra contador si caben todos', () => {
    render(<AvatarStack people={people.slice(0, 2)} />)

    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument()
  })

  it('expone el total en el nombre accesible', () => {
    render(<AvatarStack people={people} />)

    expect(screen.getByLabelText('4 personas')).toBeInTheDocument()
  })
})
