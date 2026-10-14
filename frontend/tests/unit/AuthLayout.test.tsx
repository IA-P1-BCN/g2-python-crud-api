import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from '@/layouts/AuthLayout'

function renderLayout(path = '/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<form aria-label="formulario">formulario</form>} />
          <Route path="/register" element={<form aria-label="formulario">registro</form>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthLayout', () => {
  it('muestra el logo enlazado al inicio', () => {
    renderLayout()

    const logo = screen.getByRole('link', { name: 'Ir al inicio' })
    expect(logo).toHaveTextContent('Athletica')
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renderiza el contenido de la ruta hija', () => {
    renderLayout()

    expect(screen.getByRole('form', { name: 'formulario' })).toBeInTheDocument()
    expect(screen.getByText('formulario')).toBeInTheDocument()
  })

  it('renderiza la ruta de registro dentro del layout', () => {
    renderLayout('/register')

    expect(screen.getByText('registro')).toBeInTheDocument()
  })
})
