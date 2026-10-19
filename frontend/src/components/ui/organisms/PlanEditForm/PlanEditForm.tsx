import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import { Toggle } from '@/components/ui/atoms/Toggle'
import { Alert } from '@/components/ui/molecules/Alert'
import { FormField } from '@/components/ui/molecules/FormField'
import { cn } from '@/lib/cn'
import { parsePriceCents } from '@/lib/format'
import type { MembershipPlan } from '@/types/api'

export type PlanEditValues = {
  name: string
  description: string | null
  price_cents: number
  duration_days: number
  is_active: boolean
}

export type PlanEditFormProps = {
  /** Plan to edit; without it the form starts empty to create a new one. */
  plan?: MembershipPlan
  /** Called with the parsed values when the form is valid and submitted. */
  onSubmit: (values: PlanEditValues) => void
  isLoading?: boolean
  /** Server error shown in an Alert (e.g. a failed update). */
  error?: string | null
  onCancel?: () => void
  /** Hides the visible heading; the accessible name of the form stays. */
  hideTitle?: boolean
  className?: string
}

/**
 * Admin plan form: name, description, price, duration and the active toggle.
 * Edits the given plan, or starts empty to create one.
 */
export function PlanEditForm({
  plan,
  onSubmit,
  isLoading = false,
  error = null,
  onCancel,
  hideTitle = false,
  className,
}: PlanEditFormProps) {
  const isEdit = plan !== undefined
  const title = isEdit ? 'Editar plan' : 'Nuevo plan'
  const submitLabel = isEdit ? 'Guardar cambios' : 'Crear plan'
  const [name, setName] = useState(plan?.name ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [price, setPrice] = useState(plan ? (plan.price_cents / 100).toFixed(2) : '')
  const [duration, setDuration] = useState(String(plan?.duration_days ?? 30))
  const [isActive, setIsActive] = useState(plan?.is_active ?? true)
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const priceCents = parsePriceCents(price)
    const durationDays = Number(duration)
    if (priceCents === null) {
      setFormError('El precio debe ser un importe mayor que 0')
      return
    }
    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      setFormError('La duración debe ser un número entero de días mayor que 0')
      return
    }
    setFormError(null)
    onSubmit({
      name,
      description: description || null,
      price_cents: priceCents,
      duration_days: durationDays,
      is_active: isActive,
    })
  }

  return (
    <form
      className={cn(
        'flex w-full flex-col gap-4 rounded-card border border-line bg-surface p-6',
        className,
      )}
      aria-label={title}
      noValidate
      onSubmit={handleSubmit}
    >
      {hideTitle ? null : <h2 className="font-display text-headline text-text">{title}</h2>}

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <FormField
        label="Nombre"
        name="name"
        autoComplete="off"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <FormField
        label="Descripción"
        name="description"
        autoComplete="off"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <FormField
        label="Precio (€)"
        name="price"
        inputMode="decimal"
        autoComplete="off"
        required
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />

      <FormField
        label="Duración (días)"
        name="duration"
        type="number"
        min={1}
        autoComplete="off"
        required
        value={duration}
        onChange={(event) => setDuration(event.target.value)}
      />

      <div className="flex items-center justify-between">
        <span className="text-small text-text-muted">Plan activo</span>
        <Toggle checked={isActive} onChange={setIsActive} label="Plan activo" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
