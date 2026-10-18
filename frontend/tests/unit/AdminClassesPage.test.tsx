import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classesApi, roomsApi, usersApi } from '@/api'
import { AdminClassesPage } from '@/pages/admin/AdminClassesPage'
import type { GymClass, Room, User } from '@/types/api'

vi.mock('@/api', () => ({
  classesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  roomsApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const trainer: User = {
  id: 2,
  email: 'trainer@example.com',
  full_name: 'Entrenador Uno',
  role: 'trainer',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const gymClass: GymClass = {
  id: 1,
  name: 'Yoga',
  capacity: 20,
  trainer_id: 2,
  trainer_name: 'Entrenador Uno',
  room_id: 1,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const room: Room = { id: 1, name: 'Sala 1', capacity: 20 }

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminClassesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(usersApi.list).mockResolvedValue(page([trainer]))
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
  })

  it('lista las clases con entrenador y sala', async () => {
    renderPage()

    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(screen.getAllByText(/Entrenador Uno/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sala 1/).length).toBeGreaterThan(0)
  })

  it('crea una clase', async () => {
    vi.mocked(classesApi.create).mockResolvedValue(gymClass)
    renderPage()
    await screen.findByText('Yoga')

    await userEvent.click(screen.getByRole('button', { name: 'Nueva clase' }))
    const form = screen.getByRole('form', { name: 'Nueva clase' })
    await userEvent.type(within(form).getByLabelText('Nombre'), 'Pilates')
    await userEvent.selectOptions(within(form).getByLabelText('Entrenador'), '2')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(classesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Pilates', trainer_id: 2 }),
      ),
    )
  })

  it('borra una clase tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(classesApi.remove).mockResolvedValue()
    renderPage()
    await screen.findByText('Yoga')

    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(classesApi.remove).toHaveBeenCalledWith(1))
  })
})
