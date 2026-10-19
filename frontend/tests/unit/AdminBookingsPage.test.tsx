import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookingsApi, classesApi, schedulesApi, usersApi } from '@/api'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'
import type { Booking, ClassSchedule, GymClass, User } from '@/types/api'

vi.mock('@/api', () => ({
  bookingsApi: { list: vi.fn(), create: vi.fn(), cancel: vi.fn() },
  classesApi: { list: vi.fn() },
  schedulesApi: { list: vi.fn() },
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const member: User = {
  id: 1,
  email: 'socio@example.com',
  full_name: 'Socio Uno',
  role: 'member',
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

const schedule: ClassSchedule = {
  id: 10,
  class_id: 1,
  day_of_week: 0,
  start_time: '10:00:00',
  end_time: '11:00:00',
  room_id: 1,
  created_at: '2026-10-01T10:00:00Z',
}

const booking: Booking = {
  id: 1,
  member_id: 1,
  schedule_id: 10,
  booking_date: '2026-10-05',
  status: 'confirmed',
  created_at: '2026-10-05T09:00:00Z',
}

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminBookingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingsApi.list).mockResolvedValue(page([booking]))
    vi.mocked(classesApi.list).mockResolvedValue(page([gymClass]))
    vi.mocked(schedulesApi.list).mockResolvedValue(page([schedule]))
    vi.mocked(usersApi.list).mockResolvedValue(page([member]))
  })

  it('lista las reservas con socio y clase', async () => {
    renderPage()

    expect((await screen.findAllByText('Socio Uno')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Yoga/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Confirmada').length).toBeGreaterThan(0)
  })

  it('crea una reserva', async () => {
    vi.mocked(bookingsApi.create).mockResolvedValue(booking)
    renderPage()
    await screen.findAllByText('Socio Uno')

    await userEvent.click(screen.getByRole('button', { name: 'Nueva reserva' }))
    const form = screen.getByRole('form', { name: 'Nueva reserva' })
    await userEvent.selectOptions(within(form).getByLabelText('Socio'), '1')
    await userEvent.selectOptions(within(form).getByLabelText('Horario'), '10')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(bookingsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ member_id: 1, schedule_id: 10 }),
      ),
    )
  })

  it('cancela una reserva tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(bookingsApi.cancel).mockResolvedValue()
    renderPage()
    await screen.findAllByText('Socio Uno')

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(bookingsApi.cancel).toHaveBeenCalledWith(1))
  })
})
