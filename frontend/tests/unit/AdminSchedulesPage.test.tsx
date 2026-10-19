import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classesApi, roomsApi, schedulesApi } from '@/api'
import { AdminSchedulesPage } from '@/pages/admin/AdminSchedulesPage'
import type { ClassSchedule, GymClass, Room } from '@/types/api'

vi.mock('@/api', () => ({
  schedulesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  classesApi: { list: vi.fn() },
  roomsApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

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

const schedule: ClassSchedule = {
  id: 10,
  class_id: 1,
  day_of_week: 0,
  start_time: '10:00:00',
  end_time: '11:00:00',
  room_id: 1,
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
        <AdminSchedulesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminSchedulesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(schedulesApi.list).mockResolvedValue(page([schedule]))
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(roomsApi.list).mockResolvedValue(page([room]))
  })

  it('lista los horarios con clase, día y sala', async () => {
    renderPage()

    expect((await screen.findAllByText('Yoga')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Lunes/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sala 1/).length).toBeGreaterThan(0)
  })

  it('crea un horario', async () => {
    vi.mocked(schedulesApi.create).mockResolvedValue(schedule)
    renderPage()
    await screen.findAllByText('Yoga')

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo horario' }))
    const form = screen.getByRole('form', { name: 'Nuevo horario' })
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(schedulesApi.create).toHaveBeenCalledWith({
        class_id: 1,
        day_of_week: 0,
        start_time: '10:00',
        end_time: '11:00',
        room_id: 1,
      }),
    )
  })

  it('borra un horario tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(schedulesApi.remove).mockResolvedValue()
    renderPage()
    await screen.findAllByText('Yoga')

    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(schedulesApi.remove).toHaveBeenCalledWith(10))
  })
})
