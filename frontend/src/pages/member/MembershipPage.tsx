import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, type BadgeTone } from '@/components/ui'
import { membershipPlansApi, membershipsApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { formatDate } from '@/lib/format'
import type { MembershipStatus } from '@/types/api'

const STATUS: Record<MembershipStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Activa', tone: 'success' },
  expired: { label: 'Caducada', tone: 'warning' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
}

export function MembershipPage() {
  const { user } = useAuth()

  const memberships = useQuery({
    queryKey: ['memberships', user?.id],
    enabled: user !== null,
    queryFn: () => membershipsApi.listForUser(Number(user?.id), { size: 10 }),
  })

  const plans = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => membershipPlansApi.list({ size: 100 }),
  })

  if (memberships.isLoading) {
    return <p className="table-status">Cargando…</p>
  }

  if (memberships.isError) {
    return (
      <div className="page">
        <h1>Mi membresía</h1>
        <Alert variant="error">{toApiError(memberships.error).message}</Alert>
      </div>
    )
  }

  const membership = memberships.data?.items[0]

  if (!membership) {
    return (
      <div className="page">
        <h1>Mi membresía</h1>
        <Alert variant="info">No tienes ninguna membresía asignada.</Alert>
      </div>
    )
  }

  const plan = plans.data?.items.find((item) => item.id === membership.plan_id)
  const status = STATUS[membership.status]

  return (
    <div className="page">
      <h1>Mi membresía</h1>
      <div className="card">
        <p className="card__title">{plan?.name ?? `Plan #${membership.plan_id}`}</p>
        <p>
          Estado: <Badge tone={status.tone}>{status.label}</Badge>
        </p>
        <p>Desde: {formatDate(membership.start_date)}</p>
        <p>Hasta: {formatDate(membership.end_date)}</p>
      </div>
    </div>
  )
}
