import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '@/api'
import { TrainerMembersPage } from '@/pages/trainer/TrainerMembersPage'
import type { User } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const member: User = {
  id: 1,
  email: 'ana.lopez@example.com',
  full_name: 'Ana López',
  role: 'member',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

function page<T>(items: T[]) {
  return { items, total: items.length, page: 1, size: 10, pages: 1 }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TrainerMembersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TrainerMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockResolvedValue(page([member]))
  })

  it('lista los socios con su nombre y correo', async () => {
    renderPage()

    expect(await screen.findByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('ana.lopez@example.com')).toBeInTheDocument()
    expect(usersApi.list).toHaveBeenCalledWith({
      role: 'member',
      page: 1,
      size: 10,
      search: undefined,
    })
  })

  it('muestra el estado vacío', async () => {
    vi.mocked(usersApi.list).mockResolvedValue(page([]))
    renderPage()

    expect(await screen.findByText('No hay socios con esta búsqueda.')).toBeInTheDocument()
  })

  it('muestra el error de la API', async () => {
    vi.mocked(usersApi.list).mockRejectedValue(new Error('boom'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('boom')
  })

  it('busca por nombre o correo', async () => {
    renderPage()
    await screen.findByText('Ana López')

    await userEvent.type(
      screen.getByPlaceholderText('Buscar por nombre o correo'),
      'ana.lopez@example.com',
    )

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: 'ana.lopez@example.com' }),
      ),
    )
  })
})
