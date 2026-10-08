import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '@/api'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import type { User } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    reactivate: vi.fn(),
  },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

function user(id: number, full_name: string, role: User['role']): User {
  return {
    id,
    email: `${full_name.split(' ')[0].toLowerCase()}@test.dev`,
    full_name,
    role,
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
    deactivated_at: null,
  }
}

const admin = user(1, 'Eva Admin', 'admin')
const trainer = user(2, 'Carlos Jiménez', 'trainer')
const member = user(3, 'Ana López', 'member')

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function row(name: string): HTMLElement {
  return within(screen.getByRole('table')).getByText(name).closest('tr') as HTMLElement
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockResolvedValue({
      items: [admin, trainer, member],
      total: 3,
      page: 1,
      size: 10,
      pages: 1,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista usuarios de todos los roles con su rol en español', async () => {
    renderPage()

    await screen.findByText('Eva Admin')
    expect(usersApi.list).toHaveBeenCalledWith({ page: 1, size: 10, role: undefined })
    expect(within(row('Eva Admin')).getByText('Administrador')).toBeInTheDocument()
    expect(within(row('Carlos Jiménez')).getByText('Entrenador')).toBeInTheDocument()
    expect(within(row('Ana López')).getByText('Socio')).toBeInTheDocument()
  })

  it('filtra por rol', async () => {
    renderPage()
    await screen.findByText('Eva Admin')

    await userEvent.click(screen.getByRole('button', { name: 'Entrenadores' }))

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ role: 'trainer', page: 1 }),
      ),
    )
  })

  it('da de alta un entrenador por defecto', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(trainer)
    renderPage()
    await screen.findByText('Eva Admin')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }))
    const form = screen.getByRole('form', { name: 'Nuevo usuario' })
    expect(within(form).getByLabelText('Rol')).toHaveValue('trainer')
    await userEvent.type(within(form).getByLabelText('Nombre completo'), 'Marta Gil')
    await userEvent.type(within(form).getByLabelText('Email'), 'marta@test.dev')
    await userEvent.type(within(form).getByLabelText('Contraseña inicial'), 'password123')
    await userEvent.click(within(form).getByRole('button', { name: 'Dar de alta' }))

    await waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith({
        full_name: 'Marta Gil',
        email: 'marta@test.dev',
        password: 'password123',
        role: 'trainer',
        is_active: true,
      }),
    )
  })

  it('da de alta un administrador eligiendo el rol', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(admin)
    renderPage()
    await screen.findByText('Eva Admin')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }))
    const form = screen.getByRole('form', { name: 'Nuevo usuario' })
    await userEvent.type(within(form).getByLabelText('Nombre completo'), 'Luis Admin')
    await userEvent.type(within(form).getByLabelText('Email'), 'luis@test.dev')
    await userEvent.selectOptions(within(form).getByLabelText('Rol'), 'admin')
    await userEvent.type(within(form).getByLabelText('Contraseña inicial'), 'password123')
    await userEvent.click(within(form).getByRole('button', { name: 'Dar de alta' }))

    await waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' })),
    )
  })

  it('cambia el rol de un socio a entrenador', async () => {
    vi.mocked(usersApi.update).mockResolvedValue({ ...member, role: 'trainer' })
    renderPage()
    await screen.findByText('Eva Admin')

    await userEvent.click(within(row('Ana López')).getByRole('button', { name: 'Editar' }))
    const form = screen.getByRole('form', { name: 'Editar usuario' })
    expect(within(form).getByLabelText('Rol')).toHaveValue('member')
    await userEvent.selectOptions(within(form).getByLabelText('Rol'), 'trainer')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(3, {
        full_name: 'Ana López',
        email: 'ana@test.dev',
        role: 'trainer',
      }),
    )
  })

  it('muestra el aviso de la API si una persona admin intenta darse de baja', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(usersApi.deactivate).mockRejectedValue('No puedes dar de baja tu propia cuenta')
    renderPage()
    await screen.findByText('Eva Admin')

    await userEvent.click(within(row('Eva Admin')).getByRole('button', { name: 'Dar de baja' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No puedes dar de baja tu propia cuenta',
    )
  })
})
