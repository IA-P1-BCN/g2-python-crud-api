import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SideNav, type SideNavItem } from '@/components/ui/organisms/SideNav'

const items: SideNavItem[] = [
  { to: '/member', label: 'Inicio', icon: 'home' },
  { to: '/member/bookings', label: 'Reservas', icon: 'calendar' },
  { to: '/member/membership', label: 'Mi plan', icon: 'dumbbell' },
]

function renderNav(path = '/', props: Partial<Parameters<typeof SideNav>[0]> = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SideNav items={items} {...props} />
    </MemoryRouter>,
  )
}

describe('SideNav', () => {
  it('muestra la navegación principal con un enlace por sección', () => {
    renderNav()

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/member')
    expect(screen.getByRole('link', { name: 'Reservas' })).toHaveAttribute(
      'href',
      '/member/bookings',
    )
    expect(screen.getByRole('link', { name: 'Mi plan' })).toBeInTheDocument()
  })

  it('marca el elemento activo como pastilla', () => {
    renderNav('/member/membership')

    expect(screen.getByRole('link', { name: 'Mi plan' }).className).toContain('bg-primary')
    expect(screen.getByRole('link', { name: 'Inicio' }).className).not.toContain('bg-primary')
  })

  it('avisa al abrir el menú móvil al elegir un enlace', async () => {
    const onNavigate = vi.fn()
    renderNav('/', { onNavigate })

    await userEvent.click(screen.getByRole('link', { name: 'Reservas' }))

    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
