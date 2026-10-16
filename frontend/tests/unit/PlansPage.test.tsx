import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { membershipPlansApi } from '@/api'
import { PlansPage } from '@/pages/admin/PlansPage'
import { parsePriceCents } from '@/lib/format'
import type { MembershipPlan } from '@/types/api'

vi.mock('@/api', () => ({
  membershipPlansApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  toApiError: (error: unknown) => ({ status: 0, message: String(error) }),
}))

const monthly: MembershipPlan = {
  id: 1,
  name: 'Mensual',
  description: '30 días',
  price_cents: 3999,
  duration_days: 30,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const legacy: MembershipPlan = {
  id: 2,
  name: 'Antiguo',
  description: null,
  price_cents: 2500,
  duration_days: 30,
  is_active: false,
  created_at: '2026-01-01T10:00:00Z',
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function card(name: string): HTMLElement {
  return screen.getByText(name).closest('li') as HTMLElement
}

async function openNewPlanForm(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole('button', { name: 'Nuevo plan' }))
  const dialog = screen.getByRole('dialog', { name: 'Nuevo plan' })
  return within(dialog).getByRole('form', { name: 'Nuevo plan' })
}

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(membershipPlansApi.list).mockResolvedValue({
      items: [monthly, legacy],
      total: 2,
      page: 1,
      size: 10,
      pages: 1,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista todos los planes por tarjeta, también los inactivos', async () => {
    renderPage()

    await screen.findByText('Mensual')
    expect(membershipPlansApi.list).toHaveBeenCalledWith({ page: 1, size: 10 })
    expect(within(card('Mensual')).getByText('39,99 €')).toBeInTheDocument()
    expect(within(card('Mensual')).getByText('30 días')).toBeInTheDocument()
    expect(within(card('Mensual')).getByText('Activo')).toBeInTheDocument()
    expect(within(card('Antiguo')).getByText('Inactivo')).toBeInTheDocument()
  })

  it('crea un plan convirtiendo el precio a céntimos y cierra el diálogo', async () => {
    vi.mocked(membershipPlansApi.create).mockResolvedValue(monthly)
    renderPage()
    await screen.findByText('Mensual')

    const form = await openNewPlanForm()
    await userEvent.type(within(form).getByLabelText('Nombre'), 'Anual')
    await userEvent.type(within(form).getByLabelText('Precio (€)'), '299,90')
    const duration = within(form).getByLabelText('Duración (días)')
    await userEvent.clear(duration)
    await userEvent.type(duration, '365')
    await userEvent.click(within(form).getByRole('button', { name: 'Crear plan' }))

    await waitFor(() =>
      expect(membershipPlansApi.create).toHaveBeenCalledWith({
        name: 'Anual',
        description: null,
        price_cents: 29990,
        duration_days: 365,
        is_active: true,
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('no envía un precio no válido', async () => {
    renderPage()
    await screen.findByText('Mensual')

    const form = await openNewPlanForm()
    await userEvent.type(within(form).getByLabelText('Nombre'), 'Gratis')
    await userEvent.type(within(form).getByLabelText('Precio (€)'), '0')
    await userEvent.click(within(form).getByRole('button', { name: 'Crear plan' }))

    expect(within(form).getByText('El precio debe ser un importe mayor que 0')).toBeInTheDocument()
    expect(membershipPlansApi.create).not.toHaveBeenCalled()
  })

  it('edita un plan con sus datos actuales y guarda el toggle', async () => {
    vi.mocked(membershipPlansApi.update).mockResolvedValue(monthly)
    renderPage()
    await screen.findByText('Mensual')

    await userEvent.click(within(card('Mensual')).getByRole('button', { name: 'Editar' }))
    const form = screen.getByRole('form', { name: 'Editar plan' })
    expect(within(form).getByLabelText('Precio (€)')).toHaveValue('39.99')
    const price = within(form).getByLabelText('Precio (€)')
    await userEvent.clear(price)
    await userEvent.type(price, '44.99')
    await userEvent.click(within(form).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(membershipPlansApi.update).toHaveBeenCalledWith(1, {
        name: 'Mensual',
        description: '30 días',
        price_cents: 4499,
        duration_days: 30,
        is_active: true,
      }),
    )
  })

  it('desactiva un plan activo tras confirmar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(membershipPlansApi.update).mockResolvedValue({ ...monthly, is_active: false })
    renderPage()
    await screen.findByText('Mensual')

    await userEvent.click(within(card('Mensual')).getByRole('button', { name: 'Desactivar' }))

    await waitFor(() =>
      expect(membershipPlansApi.update).toHaveBeenCalledWith(1, { is_active: false }),
    )
  })

  it('muestra el aviso de la API si el plan tiene socios y no se puede borrar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(membershipPlansApi.remove).mockRejectedValue(
      'No se puede borrar un plan con membresías asignadas; desactívalo en su lugar',
    )
    renderPage()
    await screen.findByText('Mensual')

    await userEvent.click(within(card('Mensual')).getByRole('button', { name: 'Borrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('desactívalo en su lugar')
  })

  it('no borra si no se confirma', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderPage()
    await screen.findByText('Mensual')

    await userEvent.click(within(card('Mensual')).getByRole('button', { name: 'Borrar' }))

    expect(membershipPlansApi.remove).not.toHaveBeenCalled()
  })

  it('navega a la página siguiente cuando hay más de una', async () => {
    vi.mocked(membershipPlansApi.list).mockResolvedValue({
      items: [monthly],
      total: 12,
      page: 1,
      size: 10,
      pages: 2,
    })
    renderPage()
    await screen.findByText('Mensual')

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }))

    await waitFor(() => expect(membershipPlansApi.list).toHaveBeenCalledWith({ page: 2, size: 10 }))
  })
})

describe('parsePriceCents', () => {
  it.each([
    ['39,99', 3999],
    ['39.99', 3999],
    ['40', 4000],
  ])('convierte %s en %i céntimos', (value, cents) => {
    expect(parsePriceCents(value)).toBe(cents)
  })

  it.each(['', '0', '-5', 'gratis'])('rechaza "%s"', (value) => {
    expect(parsePriceCents(value)).toBeNull()
  })
})
