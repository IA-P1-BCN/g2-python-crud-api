import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from '@/components/ui/organisms/AppHeader'

function renderHeader(props: Partial<Parameters<typeof AppHeader>[0]> = {}) {
  return render(
    <MemoryRouter>
      <AppHeader name="Eva Admin" role="admin" onLogout={() => {}} {...props} />
    </MemoryRouter>,
  )
}

describe('AppHeader', () => {
  it('muestra el logo con el subtítulo del rol', () => {
    renderHeader()

    expect(screen.getByText('Athletica')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('abre el menú de cuenta con perfil y cerrar sesión', async () => {
    renderHeader()

    const account = screen.getByRole('button', { name: 'Cuenta' })
    expect(account).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(account)

    expect(account).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('cierra sesión desde el menú', async () => {
    const onLogout = vi.fn()
    renderHeader({ onLogout })

    await userEvent.click(screen.getByRole('button', { name: 'Cuenta' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))

    expect(onLogout).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('cierra el menú con Escape', async () => {
    renderHeader()

    await userEvent.click(screen.getByRole('button', { name: 'Cuenta' }))
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
