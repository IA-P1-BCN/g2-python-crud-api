import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button } from '@/components/ui'
import { membershipPlansApi, toApiError } from '@/api'
import { parsePriceCents } from '@/lib/format'
import type { MembershipPlan } from '@/types/api'

type PlanFormProps = {
  /** Plan to edit; without it the form creates a new plan. */
  plan?: MembershipPlan
  onDone: () => void
}

export function PlanForm({ plan, onDone }: PlanFormProps) {
  const queryClient = useQueryClient()
  const isEdit = plan !== undefined
  const [name, setName] = useState(plan?.name ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [price, setPrice] = useState(plan ? (plan.price_cents / 100).toFixed(2) : '')
  const [duration, setDuration] = useState(plan ? String(plan.duration_days) : '30')
  const [formError, setFormError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: (payload: { price_cents: number; duration_days: number }) => {
      const fields = { name, description: description || null, ...payload }
      return isEdit
        ? membershipPlansApi.update(plan.id, fields)
        : membershipPlansApi.create({ ...fields, is_active: true })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['membership-plans'] })
      onDone()
    },
  })

  function handleSubmit(event: FormEvent) {
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
    save.mutate({ price_cents: priceCents, duration_days: durationDays })
  }

  const title = isEdit ? 'Editar plan' : 'Nuevo plan'

  return (
    <form className="form card" onSubmit={handleSubmit} aria-label={title}>
      <h2 className="card__title">{title}</h2>

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {save.isError ? <Alert variant="error">{toApiError(save.error).message}</Alert> : null}

      <label className="field">
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="field">
        Descripción
        <input value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="field">
        Precio (€)
        <input
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />
      </label>
      <label className="field">
        Duración (días)
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          required
        />
      </label>

      <div className="form__actions">
        <Button type="submit" isLoading={save.isPending}>
          {isEdit ? 'Guardar cambios' : 'Crear plan'}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
