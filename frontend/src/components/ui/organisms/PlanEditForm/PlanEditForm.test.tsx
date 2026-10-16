import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlanEditForm, type PlanEditFormProps } from '@/components/ui/organisms/PlanEditForm'
import type { MembershipPlan } from '@/types/api'

const plan: MembershipPlan = {
  id: 7,
  name: 'Plan Básico',
  description: 'Clases colectivas incluidas',
  price_cents: 2000,
  duration_days: 30,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
}

function renderForm(overrides: Partial<PlanEditFormProps> = {}) {
  const spies = { onSubmit: vi.fn(), onCancel: vi.fn() }
  const utils = render(<PlanEditForm plan={plan} {...spies} {...overrides} />)
  return { ...utils, ...spies }
}

describe('PlanEditForm', () => {
  it('rellena los campos y el toggle con el plan', () => {
    renderForm()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Plan Básico')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Clases colectivas incluidas')
    expect(screen.getByLabelText('Precio (€)')).toHaveValue('20.00')
    expect(screen.getByLabelText('Duración (días)')).toHaveValue(30)
    expect(screen.getByRole('switch', { name: 'Plan activo' })).toBeChecked()
  })

  it('emite los valores parseados al enviar', async () => {
    const { onSubmit } = renderForm()
    await userEvent.clear(screen.getByLabelText('Precio (€)'))
    await userEvent.type(screen.getByLabelText('Precio (€)'), '39,99')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Plan Básico',
      description: 'Clases colectivas incluidas',
      price_cents: 3999,
      duration_days: 30,
      is_active: true,
    })
  })

  it('emite descripción null cuando está vacía', async () => {
    const { onSubmit } = renderForm()
    await userEvent.clear(screen.getByLabelText('Descripción'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: null }))
  })

  it('emite is_active según el toggle', async () => {
    const { onSubmit } = renderForm()
    await userEvent.click(screen.getByRole('switch', { name: 'Plan activo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }))
  })

  it('no envía con precio inválido y muestra el mensaje', async () => {
    const { onSubmit } = renderForm()
    await userEvent.clear(screen.getByLabelText('Precio (€)'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('El precio debe ser un importe mayor que 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no envía con duración inválida y muestra el mensaje', async () => {
    const { onSubmit } = renderForm()
    await userEvent.clear(screen.getByLabelText('Duración (días)'))
    await userEvent.type(screen.getByLabelText('Duración (días)'), '0')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(
      screen.getByText('La duración debe ser un número entero de días mayor que 0'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra el error del servidor en un Alert', () => {
    renderForm({ error: 'No se pudo guardar el plan' })
    expect(screen.getByText('No se pudo guardar el plan')).toBeInTheDocument()
  })

  it('Cancelar llama a onCancel', async () => {
    const { onCancel } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('deshabilita el envío mientras carga', () => {
    renderForm({ isLoading: true })
    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeDisabled()
  })

  it('modo creación: empieza vacío, con duración 30 y activo', () => {
    renderForm({ plan: undefined })
    expect(screen.getByRole('form', { name: 'Nuevo plan' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
    expect(screen.getByLabelText('Descripción')).toHaveValue('')
    expect(screen.getByLabelText('Precio (€)')).toHaveValue('')
    expect(screen.getByLabelText('Duración (días)')).toHaveValue(30)
    expect(screen.getByRole('switch', { name: 'Plan activo' })).toBeChecked()
  })

  it('modo creación: «Crear plan» emite los valores', async () => {
    const { onSubmit } = renderForm({ plan: undefined })
    await userEvent.type(screen.getByLabelText('Nombre'), 'Anual')
    await userEvent.type(screen.getByLabelText('Precio (€)'), '12,50')
    await userEvent.click(screen.getByRole('button', { name: 'Crear plan' }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Anual',
      description: null,
      price_cents: 1250,
      duration_days: 30,
      is_active: true,
    })
  })

  it('hideTitle oculta el encabezado pero el formulario mantiene su nombre accesible', () => {
    renderForm({ hideTitle: true })
    expect(screen.queryByRole('heading', { name: 'Editar plan' })).not.toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Editar plan' })).toBeInTheDocument()
  })
})
