import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BottomNav, type BottomNavItem } from '@/components/ui/organisms/BottomNav'

const items: BottomNavItem[] = [
  { to: '/member', label: 'Inicio', icon: 'home' },
  { to: '/member/bookings', label: 'Reservas', icon: 'calendar' },
  { to: '/member/membership', label: 'Mi plan', icon: 'dumbbell' },
]

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav items={items} />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('muestra un elemento por pestaña', () => {
    renderNav()

    expect(screen.getByRole('navigation', { name: 'Navegación inferior' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reservas' })).toHaveAttribute(
      'href',
      '/member/bookings',
    )
  })

  it('marca el elemento activo como pastilla', () => {
    renderNav('/member/bookings')

    expect(screen.getByRole('link', { name: 'Reservas' }).className).toContain('bg-primary')
    expect(screen.getByRole('link', { name: 'Inicio' }).className).not.toContain('bg-primary')
  })
})
