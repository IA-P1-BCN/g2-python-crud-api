import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TopNav, type TopNavItem } from '@/components/ui/organisms/TopNav'

const items: TopNavItem[] = [
  { to: '/member', label: 'Inicio', icon: 'home' },
  { to: '/member/bookings', label: 'Reservas', icon: 'calendar' },
  { to: '/member/membership', label: 'Mi plan', icon: 'dumbbell' },
]

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TopNav items={items} />
    </MemoryRouter>,
  )
}

describe('TopNav', () => {
  it('muestra los mismos elementos que BottomNav', () => {
    renderNav()

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/member')
    expect(screen.getByRole('link', { name: 'Reservas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi plan' })).toBeInTheDocument()
  })

  it('marca el elemento activo como pastilla', () => {
    renderNav('/member/membership')

    expect(screen.getByRole('link', { name: 'Mi plan' }).className).toContain('bg-primary')
    expect(screen.getByRole('link', { name: 'Inicio' }).className).not.toContain('bg-primary')
  })
})
