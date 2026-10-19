import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { roomsApi } from '@/api'
import { AdminRoomsPage } from '@/pages/admin/AdminRoomsPage'
import type { Room } from '@/types/api'

vi.mock('@/api', () => ({
  roomsApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const room: Room = { id: 1, name: 'Sala 1', capacity: 20 }

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminRoomsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminRoomsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
  })

  it('lista las salas', async () => {
    renderPage()

    expect(await screen.findByText('Sala 1')).toBeInTheDocument()
    expect(screen.getByText('20 plazas')).toBeInTheDocument()
  })

  it('crea una sala', async () => {
    vi.mocked(roomsApi.create).mockResolvedValue({ ...room, id: 2, name: 'Sala 2' })
    renderPage()
    await screen.findByText('Sala 1')

    await userEvent.click(screen.getByRole('button', { name: 'Nueva sala' }))
    const form = screen.getByRole('form', { name: 'Nueva sala' })
    await userEvent.type(within(form).getByLabelText('Nombre'), 'Sala 2')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(roomsApi.create).toHaveBeenCalledWith({ name: 'Sala 2', capacity: 10 }),
    )
  })

  it('borra una sala tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(roomsApi.remove).mockResolvedValue()
    renderPage()
    await screen.findByText('Sala 1')

    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(roomsApi.remove).toHaveBeenCalledWith(1))
  })
})
