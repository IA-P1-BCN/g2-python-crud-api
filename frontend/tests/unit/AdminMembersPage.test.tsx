import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, membershipsApi, usersApi } from '@/api'
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage'
import type { User, UserPage } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    reactivate: vi.fn(),
    exportMembersCsv: vi.fn(),
  },
  membershipsApi: { listForUser: vi.fn() },
  bookingsApi: { listForUser: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const ana: User = {
  id: 1,
  email: 'ana@test.dev',
  full_name: 'Ana López',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const bea: User = {
  id: 2,
  email: 'bea@test.dev',
  full_name: 'Bea Ruiz',
  role: 'member',
  is_active: false,
  created_at: '2026-01-15T10:00:00Z',
  deactivated_at: '2026-10-05T10:00:00Z',
}

function page(items: User[]): UserPage {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminMembersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function membersTable(): HTMLElement {
  return screen.getAllByRole('table')[0]
}

function row(name: string): HTMLElement {
  return within(membersTable()).getByText(name).closest('tr') as HTMLElement
}

describe('AdminMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockResolvedValue(page([ana, bea]))
    vi.mocked(membershipsApi.listForUser).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 100,
      pages: 1,
    })
    vi.mocked(bookingsApi.listForUser).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      size: 100,
      pages: 1,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista solo socios, con su estado', async () => {
    renderPage()

    await screen.findAllByText('Ana López')
    expect(usersApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'member', page: 1, size: 10 }),
    )
    expect(within(row('Ana López')).getByText('Activo')).toBeInTheDocument()
    expect(within(row('Bea Ruiz')).getByText(/Baja · 05\/10\/2026/)).toBeInTheDocument()
  })

  it('busca por nombre o email', async () => {
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.type(screen.getByLabelText('Buscar por nombre o email'), ' ana ')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'ana' })),
    )
  })

  it('filtra por estado', async () => {
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(screen.getByRole('button', { name: 'De baja' }))

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ is_active: false, page: 1 }),
      ),
    )
  })

  it('da de baja a un socio tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(usersApi.deactivate).mockResolvedValue()
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(within(row('Ana López')).getByRole('button', { name: 'Dar de baja' }))

    await waitFor(() => expect(usersApi.deactivate).toHaveBeenCalledWith(1))
  })

  it('no hace nada si no se confirma la baja', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(within(row('Ana López')).getByRole('button', { name: 'Dar de baja' }))

    expect(usersApi.deactivate).not.toHaveBeenCalled()
  })

  it('reactiva a un socio dado de baja', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(usersApi.reactivate).mockResolvedValue({ ...bea, is_active: true })
    renderPage()
    await screen.findAllByText('Bea Ruiz')

    await userEvent.click(within(row('Bea Ruiz')).getByRole('button', { name: 'Reactivar' }))

    await waitFor(() => expect(usersApi.reactivate).toHaveBeenCalledWith(2))
  })

  it('da de alta un socio nuevo', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(ana)
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo socio' }))
    const form = screen.getByRole('form', { name: 'Nuevo socio' })
    await userEvent.type(within(form).getByLabelText('Nombre completo'), 'Carla Díaz')
    await userEvent.type(within(form).getByLabelText('Email'), 'carla@test.dev')
    await userEvent.type(within(form).getByLabelText('Contraseña inicial'), 'password123')
    await userEvent.click(within(form).getByRole('button', { name: 'Dar de alta' }))

    await waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith({
        full_name: 'Carla Díaz',
        email: 'carla@test.dev',
        password: 'password123',
        role: 'member',
        is_active: true,
      }),
    )
  })

  it('valida la contraseña antes de enviar el alta', async () => {
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo socio' }))
    const form = screen.getByRole('form', { name: 'Nuevo socio' })
    await userEvent.type(within(form).getByLabelText('Nombre completo'), 'Carla')
    await userEvent.type(within(form).getByLabelText('Email'), 'carla@test.dev')
    await userEvent.type(within(form).getByLabelText('Contraseña inicial'), 'corta')
    await userEvent.click(within(form).getByRole('button', { name: 'Dar de alta' }))

    expect(
      within(form).getByText('La contraseña debe tener al menos 8 caracteres'),
    ).toBeInTheDocument()
    expect(usersApi.create).not.toHaveBeenCalled()
  })

  it('muestra el error de la API al dar de alta', async () => {
    vi.mocked(usersApi.create).mockRejectedValue('El email ya está registrado')
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo socio' }))
    const form = screen.getByRole('form', { name: 'Nuevo socio' })
    await userEvent.type(within(form).getByLabelText('Nombre completo'), 'Ana')
    await userEvent.type(within(form).getByLabelText('Email'), 'ana@test.dev')
    await userEvent.type(within(form).getByLabelText('Contraseña inicial'), 'password123')
    await userEvent.click(within(form).getByRole('button', { name: 'Dar de alta' }))

    expect(await within(form).findByText('El email ya está registrado')).toBeInTheDocument()
  })

  it('edita los datos de un socio', async () => {
    vi.mocked(usersApi.update).mockResolvedValue({ ...ana, full_name: 'Ana López Gil' })
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(within(row('Ana López')).getByRole('button', { name: 'Editar' }))
    const form = screen.getByRole('form', { name: 'Editar socio' })
    const name = within(form).getByLabelText('Nombre completo')
    await userEvent.clear(name)
    await userEvent.type(name, 'Ana López Gil')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(1, {
        full_name: 'Ana López Gil',
        email: 'ana@test.dev',
      }),
    )
  })

  it('abre la ficha del socio con sus membresías y reservas', async () => {
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(within(row('Ana López')).getByRole('button', { name: 'Ver' }))

    expect(await screen.findByRole('region', { name: 'Ficha de Ana López' })).toBeInTheDocument()
    await waitFor(() => expect(membershipsApi.listForUser).toHaveBeenCalledWith(1, { size: 100 }))
    expect(bookingsApi.listForUser).toHaveBeenCalledWith(1, { size: 100 })
  })

  it('exporta los socios a CSV', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:socios')
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.mocked(usersApi.exportMembersCsv).mockResolvedValue(new Blob(['id,email']))
    renderPage()
    await screen.findAllByText('Ana López')

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    await waitFor(() => expect(click).toHaveBeenCalled())
    expect(usersApi.exportMembersCsv).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:socios')
  })

  it('muestra el informe de altas y bajas del mes por defecto', async () => {
    renderPage()

    const report = await screen.findByRole('region', { name: 'Altas y bajas' })
    expect(within(report).getByRole('button', { name: 'Este mes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await waitFor(() =>
      expect(usersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'member', created_from: expect.any(String) }),
      ),
    )
    expect(usersApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'member', deactivated_from: expect.any(String) }),
    )
  })
})
