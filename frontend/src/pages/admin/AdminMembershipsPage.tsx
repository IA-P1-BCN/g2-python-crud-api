import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { membershipPlansApi, membershipsApi, toApiError, usersApi } from '@/api'
import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { formatDate } from '@/lib/format'
import type { Membership, MembershipStatus } from '@/types/api'

const PAGE_SIZE = 10
const SELECT_CLASS =
  'w-full rounded-full border border-white/10 bg-surface-sunken px-4 py-3 text-body text-text outline-none focus-visible:border-primary'

const STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Activa',
  expired: 'Caducada',
  cancelled: 'Cancelada',
}

type MembershipForm = {
  id: number | null
  user_id: string
  plan_id: string
  start_date: string
  status: MembershipStatus
}

function emptyForm(planId: string): MembershipForm {
  return {
    id: null,
    user_id: '',
    plan_id: planId,
    start_date: new Date().toISOString().slice(0, 10),
    status: 'active',
  }
}

export function AdminMembershipsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<MembershipStatus | ''>('')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState<MembershipForm | null>(null)

  const members = useQuery({
    queryKey: ['users', 'members'],
    queryFn: () => usersApi.list({ role: 'member', size: 100 }),
  })
  const plans = useQuery({
    queryKey: ['membership-plans', 'active'],
    queryFn: () => membershipPlansApi.list({ active_only: true, size: 100 }),
  })

  const memberships = useQuery({
    queryKey: ['memberships', 'admin', { page, status, userId }],
    queryFn: () =>
      membershipsApi.list({
        page,
        size: PAGE_SIZE,
        status_filter: status || undefined,
        user_id: userId ? Number(userId) : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['memberships'] })

  const save = useMutation({
    mutationFn: (data: MembershipForm) =>
      data.id === null
        ? membershipsApi.create({
            user_id: Number(data.user_id),
            plan_id: Number(data.plan_id),
            start_date: data.start_date,
          })
        : membershipsApi.update(data.id, { start_date: data.start_date, status: data.status }),
    onSuccess: () => {
      setForm(null)
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => membershipsApi.remove(id),
    onSuccess: refresh,
  })

  function handleCreate() {
    setForm(emptyForm(plans.data?.items[0] ? String(plans.data.items[0].id) : ''))
  }

  function handleDelete(id: number) {
    if (window.confirm('¿Borrar esta membresía? Esta acción no se puede deshacer.')) {
      remove.mutate(id)
    }
  }

  const items = memberships.data?.items ?? []
  const memberName = (id: number) =>
    (members.data?.items ?? []).find((user) => user.id === id)?.full_name ?? `Socio #${id}`
  const planName = (id: number) =>
    (plans.data?.items ?? []).find((plan) => plan.id === id)?.name ?? `Plan #${id}`
  const canSave =
    form !== null &&
    form.start_date.length > 0 &&
    (form.id !== null || (form.user_id !== '' && form.plan_id !== ''))

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Membresías</h1>
        <Button onClick={handleCreate}>Asignar membresía</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Estado
          <select
            className={SELECT_CLASS}
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value as MembershipStatus | '')
            }}
          >
            <option value="">Todos</option>
            {(Object.keys(STATUS_LABELS) as MembershipStatus[]).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Socio
          <select
            className={SELECT_CLASS}
            value={userId}
            onChange={(event) => {
              setPage(1)
              setUserId(event.target.value)
            }}
          >
            <option value="">Todos</option>
            {(members.data?.items ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {remove.isError ? <Alert variant="error">{toApiError(remove.error).message}</Alert> : null}
      {memberships.isError ? (
        <Alert variant="error">{toApiError(memberships.error).message}</Alert>
      ) : null}

      {form ? (
        <form
          className="flex flex-col gap-3 rounded-card bg-surface p-4"
          aria-label={form.id === null ? 'Asignar membresía' : 'Editar membresía'}
          onSubmit={(event) => {
            event.preventDefault()
            if (canSave) save.mutate(form)
          }}
        >
          {save.isError ? <Alert variant="error">{toApiError(save.error).message}</Alert> : null}
          {form.id === null ? (
            <>
              <label className="flex flex-col gap-1 text-small text-text-muted">
                Socio
                <select
                  className={SELECT_CLASS}
                  value={form.user_id}
                  onChange={(event) => setForm({ ...form, user_id: event.target.value })}
                  required
                >
                  <option value="">Elige un socio</option>
                  {(members.data?.items ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-small text-text-muted">
                Plan
                <select
                  className={SELECT_CLASS}
                  value={form.plan_id}
                  onChange={(event) => setForm({ ...form, plan_id: event.target.value })}
                  required
                >
                  <option value="">Elige un plan</option>
                  {(plans.data?.items ?? []).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label className="flex flex-col gap-1 text-small text-text-muted">
              Estado
              <select
                className={SELECT_CLASS}
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as MembershipStatus })
                }
              >
                {(Object.keys(STATUS_LABELS) as MembershipStatus[]).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Fecha de inicio
            <Input
              type="date"
              value={form.start_date}
              onChange={(event) => setForm({ ...form, start_date: event.target.value })}
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={save.isPending} disabled={!canSave}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {memberships.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!memberships.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay membresías con estos filtros.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((membership: Membership) => (
            <li
              key={membership.id}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-4"
            >
              <div className="flex flex-col">
                <span className="font-display text-title text-text">
                  {memberName(membership.user_id)}
                </span>
                <span className="text-small text-text-muted">
                  {planName(membership.plan_id)} · {formatDate(membership.start_date)} –{' '}
                  {formatDate(membership.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    membership.status === 'active'
                      ? 'success'
                      : membership.status === 'expired'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {STATUS_LABELS[membership.status]}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      id: membership.id,
                      user_id: String(membership.user_id),
                      plan_id: String(membership.plan_id),
                      start_date: membership.start_date,
                      status: membership.status,
                    })
                  }
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(membership.id)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {memberships.data && memberships.data.pages > 1 ? (
        <Pagination page={page} pages={memberships.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
