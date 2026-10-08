import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import type { DashboardSummary } from '@/types/api'

vi.mock('@/api', () => ({
  adminApi: { dashboard: vi.fn() },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const summary: DashboardSummary = {
  period: { key: '7d', start: '2026-10-01', end: '2026-10-07' },
  members: { active: 248, signups: 12, sign_offs: 3 },
  weekly_movements: [
    { start: '2026-09-10', end: '2026-09-16', signups: 5, sign_offs: 1 },
    { start: '2026-09-17', end: '2026-09-23', signups: 8, sign_offs: 2 },
    { start: '2026-09-24', end: '2026-09-30', signups: 9, sign_offs: 0 },
    { start: '2026-10-01', end: '2026-10-07', signups: 12, sign_offs: 3 },
  ],
  bookings: {
    total: 3,
    by_day: [
      { day: '2026-10-06', count: 1 },
      { day: '2026-10-07', count: 2 },
    ],
  },
  occupancy: {
    average_rate: 0.71,
    by_class: [{ class_id: 1, name: 'Spinning', booked: 46, capacity: 50, rate: 0.92 }],
  },
  expiring_memberships: [
    {
      membership_id: 7,
      user_id: 3,
      full_name: 'Elena Ramos',
      plan_name: 'Plan Anual',
      end_date: '2026-10-09',
      days_left: 2,
    },
  ],
  plans: {
    active_memberships: 2,
    monthly_recurring_cents: 6000,
    by_plan: [{ plan_id: 1, name: 'Mensual', price_cents: 3000, members: 2, share: 1 }],
  },
  popular_classes: [{ class_id: 1, name: 'Spinning', bookings: 46 }],
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function card(title: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: title })
  return heading.closest('article, section') as HTMLElement
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(adminApi.dashboard).mockResolvedValue(summary)
  })

  it('pide el resumen de los últimos 7 días por defecto', async () => {
    renderPage()

    await screen.findByText('248')
    expect(adminApi.dashboard).toHaveBeenCalledWith('7d')
    expect(screen.getByRole('button', { name: '7 días' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('muestra las cifras principales', async () => {
    renderPage()

    await screen.findByText('248')
    expect(within(card('Altas')).getByText('12')).toBeInTheDocument()
    expect(within(card('Bajas')).getByText('3')).toBeInTheDocument()
    expect(within(card('Reservas')).getByText('3')).toBeInTheDocument()
    expect(within(card('Ocupación media')).getByText('71 %')).toBeInTheDocument()
    expect(within(card('Facturación mensual estimada')).getByText(/60,00/)).toBeInTheDocument()
  })

  it('lista las membresías que vencen pronto', async () => {
    renderPage()

    const section = await screen.findByRole('heading', { name: 'Membresías que vencen en 7 días' })
    const table = within(section.closest('section') as HTMLElement)
    expect(table.getByText('Elena Ramos')).toBeInTheDocument()
    expect(table.getByText('Plan Anual')).toBeInTheDocument()
    expect(table.getByText('2 días')).toBeInTheDocument()
  })

  it('muestra la ocupación por clase en porcentaje', async () => {
    renderPage()

    await screen.findByText('248')
    const section = within(card('Ocupación de clases'))
    expect(section.getByText('46 / 50')).toBeInTheDocument()
    expect(section.getByText('92 %')).toBeInTheDocument()
  })

  it('cambia de periodo al pulsar otro botón', async () => {
    renderPage()
    await screen.findByText('248')

    await userEvent.click(screen.getByRole('button', { name: '30 días' }))

    expect(adminApi.dashboard).toHaveBeenLastCalledWith('30d')
    expect(screen.getByRole('button', { name: '30 días' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('muestra el mensaje de la API si falla', async () => {
    vi.mocked(adminApi.dashboard).mockRejectedValue('No tienes permiso')
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
  })

  it('avisa cuando no hay datos en una sección', async () => {
    vi.mocked(adminApi.dashboard).mockResolvedValue({
      ...summary,
      expiring_memberships: [],
      popular_classes: [],
    })
    renderPage()

    expect(
      await screen.findByText('Ninguna membresía vence en los próximos 7 días.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No hay reservas en este periodo.')).toBeInTheDocument()
  })
})
