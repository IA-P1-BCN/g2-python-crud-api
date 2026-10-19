import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { Sheet } from '@/components/ui/molecules/Sheet'
import { PlanEditForm, type PlanEditValues } from '@/components/ui/organisms/PlanEditForm'
import { PlansAdminList } from '@/components/ui/organisms/PlansAdminList'
import { membershipPlansApi, toApiError } from '@/api'
import type { MembershipPlan } from '@/types/api'

const PAGE_SIZE = 10

/** Which form is open inside the sheet. */
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

  const save = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: PlanEditValues }) =>
      id === undefined ? membershipPlansApi.create(values) : membershipPlansApi.update(id, values),
    onSuccess: () => {
      refresh()
      setPanel(null)
    },
  })

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

  const actionError = toggleActive.error ?? remove.error
  const editing = panel?.kind === 'edit' ? panel.plan : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Planes</h1>
        <Button onClick={() => setPanel({ kind: 'create' })}>Nuevo plan</Button>
      </div>
      <p className="text-small text-text-muted">
        Un plan con socios no se puede borrar: desactívalo para que no se asigne a nuevas
        membresías.
      </p>

      {plans.isError ? <Alert variant="error">{toApiError(plans.error).message}</Alert> : null}
      {actionError ? <Alert variant="error">{toApiError(actionError).message}</Alert> : null}

      <PlansAdminList
        plans={plans.data?.items ?? []}
        isLoading={plans.isLoading}
        onEdit={(plan) => setPanel({ kind: 'edit', plan })}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />

      {plans.data && plans.data.pages > 1 ? (
        <Pagination page={page} pages={plans.data.pages} onChange={setPage} />
      ) : null}

      <Sheet
        isOpen={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.kind === 'create' ? 'Nuevo plan' : 'Editar plan'}
      >
        {panel ? (
          <PlanEditForm
            key={editing ? editing.id : 'new'}
            plan={editing}
            hideTitle
            isLoading={save.isPending}
            error={save.error ? toApiError(save.error).message : null}
            onSubmit={(values) => save.mutate(editing ? { id: editing.id, values } : { values })}
            onCancel={() => setPanel(null)}
          />
        ) : null}
      </Sheet>
    </div>
  )
}
