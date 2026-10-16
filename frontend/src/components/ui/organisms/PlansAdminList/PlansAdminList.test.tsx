import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlansAdminList, type PlansAdminListProps } from '@/components/ui/organisms/PlansAdminList'
import { formatPrice } from '@/lib/format'
import type { MembershipPlan } from '@/types/api'

const activePlan: MembershipPlan = {
  id: 1,
  name: 'Plan Básico',
  description: 'Clases colectivas incluidas',
  price_cents: 2000,
  duration_days: 30,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

const inactivePlan: MembershipPlan = {
  id: 2,
  name: 'Plan Premium',
  description: null,
  price_cents: 5000,
  duration_days: 90,
  is_active: false,
  created_at: '2026-10-01T10:00:00Z',
}

function renderList(overrides: Partial<PlansAdminListProps> = {}) {
  const spies = { onEdit: vi.fn(), onToggle: vi.fn(), onRemove: vi.fn() }
  const utils = render(
    <PlansAdminList plans={[activePlan, inactivePlan]} {...spies} {...overrides} />,
  )
  return { ...utils, ...spies }
}

describe('PlansAdminList', () => {
  it('pinta una card por plan con nombre, precio y duración', () => {
    renderList()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Plan Básico' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan Premium' })).toBeInTheDocument()
    // The DOM normalises the NBSP from Intl to a plain space; the matcher string does not.
    expect(screen.getByText(formatPrice(2000).replace(/\s+/g, ' '))).toBeInTheDocument()
    expect(screen.getByText('Cada 30 días')).toBeInTheDocument()
    expect(screen.getByText('Cada 90 días')).toBeInTheDocument()
  })

  it('muestra el estado de cada plan en su badge', () => {
    renderList()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('edita el plan correspondiente', async () => {
    const { onEdit } = renderList()
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    expect(onEdit).toHaveBeenCalledWith(activePlan)
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[1])
    expect(onEdit).toHaveBeenCalledWith(inactivePlan)
  })

  it('alterna el plan con Activar/Desactivar', async () => {
    const { onToggle } = renderList()
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(onToggle).toHaveBeenCalledWith(activePlan)
    await userEvent.click(screen.getByRole('button', { name: 'Activar' }))
    expect(onToggle).toHaveBeenCalledWith(inactivePlan)
  })

  it('borra el plan correspondiente', async () => {
    const { onRemove } = renderList()
    await userEvent.click(screen.getAllByRole('button', { name: 'Borrar' })[0])
    expect(onRemove).toHaveBeenCalledWith(activePlan)
  })

  it('muestra Cargando… y esqueletos mientras carga, sin cards ni vacío', () => {
    const { container } = renderList({ isLoading: true, plans: [] })
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
    expect(container.querySelectorAll('li')).toHaveLength(3)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByText('Todavía no hay planes.')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay planes', () => {
    renderList({ plans: [] })
    expect(screen.getByText('Todavía no hay planes.')).toBeInTheDocument()
  })
})
