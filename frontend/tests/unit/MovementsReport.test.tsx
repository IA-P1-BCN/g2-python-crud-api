import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '@/api'
import { MovementsReport } from '@/pages/admin/members/MovementsReport'
import type { User, UserPage } from '@/types/api'

vi.mock('@/api', () => ({
  usersApi: { list: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const signup: User = {
  id: 1,
  email: 'alta@example.com',
  full_name: 'Socio Alta',
  role: 'member',
  is_active: true,
  created_at: '2026-10-05T10:00:00Z',
  deactivated_at: null,
}

const signOff: User = {
  id: 2,
  email: 'baja@example.com',
  full_name: 'Socio Baja',
  role: 'member',
  is_active: false,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: '2026-10-10T10:00:00Z',
}

function page(items: User[]): UserPage {
  return { items, total: items.length, page: 1, size: 100, pages: 1 }
}

function renderReport() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MovementsReport />
    </QueryClientProvider>,
  )
}

describe('MovementsReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.list).mockImplementation(async (params) =>
      params?.deactivated_from ? page([signOff]) : page([signup]),
    )
  })

  it('muestra las dos tablas, de altas y de bajas', async () => {
    renderReport()

    expect(await screen.findByRole('heading', { name: 'Altas: 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bajas: 1' })).toBeInTheDocument()
    expect(screen.getAllByRole('table')).toHaveLength(2)
  })

  it('pinta cada movimiento en su propia tabla', async () => {
    renderReport()
    await screen.findByRole('heading', { name: 'Altas: 1' })

    const [signUps, signOffs] = screen.getAllByRole('table')
    expect(within(signUps).getByText('Socio Alta')).toBeInTheDocument()
    expect(within(signUps).queryByText('Socio Baja')).not.toBeInTheDocument()
    expect(within(signOffs).getByText('Socio Baja')).toBeInTheDocument()
    expect(within(signOffs).queryByText('Socio Alta')).not.toBeInTheDocument()
  })

  it('pide altas y bajas del periodo seleccionado', async () => {
    renderReport()
    await screen.findByRole('heading', { name: 'Altas: 1' })

    const calls = vi.mocked(usersApi.list).mock.calls.map(([params]) => params)
    expect(calls).toHaveLength(2)
    expect(calls.every((params) => params?.role === 'member')).toBe(true)
    expect(calls.filter((params) => params?.deactivated_from)).toHaveLength(1)
  })
})
