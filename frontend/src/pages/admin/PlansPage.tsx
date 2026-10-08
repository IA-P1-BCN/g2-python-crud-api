import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Pagination, Table, type Column } from '@/components/ui'
import { membershipPlansApi, toApiError } from '@/api'
import { formatPrice } from '@/lib/format'
import type { MembershipPlan } from '@/types/api'
import { PlanForm } from './plans/PlanForm'

const PAGE_SIZE = 10

/** Which form is open below the table. */
type Panel = { kind: 'create' } | { kind: 'edit'; plan: MembershipPlan }

export function PlansPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [panel, setPanel] = useState<Panel | null>(null)

  const plans = useQuery({
    queryKey: ['membership-plans', 'admin', page],
    queryFn: () => membershipPlansApi.list({ page, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['membership-plans'] })

  const toggleActive = useMutation({
    mutationFn: (plan: MembershipPlan) =>
      membershipPlansApi.update(plan.id, { is_active: !plan.is_active }),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (plan: MembershipPlan) => membershipPlansApi.remove(plan.id),
    onSuccess: refresh,
  })

  function handleToggle(plan: MembershipPlan) {
    const question = plan.is_active
      ? `¿Desactivar "${plan.name}"? No se podrá asignar a nuevas membresías.`
      : `¿Activar "${plan.name}"?`
    if (window.confirm(question)) toggleActive.mutate(plan)
  }

  function handleRemove(plan: MembershipPlan) {
    if (window.confirm(`¿Borrar "${plan.name}"? Esta acción no se puede deshacer.`)) {
      remove.mutate(plan)
    }
  }

  const columns: Column<MembershipPlan>[] = [
    { key: 'name', header: 'Plan' },
    { key: 'price_cents', header: 'Precio', render: (row) => formatPrice(row.price_cents) },
    { key: 'duration_days', header: 'Duración', render: (row) => `${row.duration_days} días` },
    { key: 'description', header: 'Descripción', render: (row) => row.description ?? '' },
    {
      key: 'is_active',
      header: 'Estado',
      render: (row) =>
        row.is_active ? <Badge tone="success">Activo</Badge> : <Badge>Inactivo</Badge>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => setPanel({ kind: 'edit', plan: row })}>
            Editar
          </Button>
          <Button variant={row.is_active ? 'ghost' : 'primary'} onClick={() => handleToggle(row)}>
            {row.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button variant="danger" onClick={() => handleRemove(row)}>
            Borrar
          </Button>
        </div>
      ),
    },
  ]

  const actionError = toggleActive.error ?? remove.error

  return (
    <div className="page">
      <div className="page__header">
        <h1>Planes</h1>
        <Button onClick={() => setPanel({ kind: 'create' })}>Nuevo plan</Button>
      </div>
      <p className="card__meta">
        Un plan con socios no se puede borrar: desactívalo para que no se asigne a nuevas
        membresías.
      </p>

      {plans.isError ? <Alert variant="error">{toApiError(plans.error).message}</Alert> : null}
      {actionError ? <Alert variant="error">{toApiError(actionError).message}</Alert> : null}

      <Table
        columns={columns}
        rows={plans.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={plans.isLoading}
        emptyMessage="Todavía no hay planes."
      />

      {plans.data && plans.data.pages > 1 ? (
        <Pagination page={page} pages={plans.data.pages} onChange={setPage} />
      ) : null}

      {panel?.kind === 'create' ? <PlanForm onDone={() => setPanel(null)} /> : null}
      {panel?.kind === 'edit' ? (
        <PlanForm key={panel.plan.id} plan={panel.plan} onDone={() => setPanel(null)} />
      ) : null}
    </div>
  )
}
