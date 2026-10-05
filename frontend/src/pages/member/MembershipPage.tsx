import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, type BadgeTone } from '@/components/ui'
import { membershipsApi, toApiError } from '@/api'
import { formatDate } from '@/lib/format'
import type { MembershipStatus } from '@/types/schema'

const STATUS: Record<MembershipStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Activa', tone: 'success' },
  expired: { label: 'Caducada', tone: 'warning' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
}

export function MembershipPage() {
  const membership = useQuery({
    queryKey: ['membership'],
    queryFn: () => membershipsApi.mine(),
  })

  if (membership.isLoading) {
    return <p className="table-status">Cargando…</p>
  }

  if (membership.isError) {
    const error = toApiError(membership.error)
    return (
      <div className="page">
        <h1>Mi membresía</h1>
        {error.status === 404 ? (
          <Alert variant="info">No tienes ninguna membresía asignada.</Alert>
        ) : (
          <Alert variant="error">{error.message}</Alert>
        )}
      </div>
    )
  }

  const data = membership.data
  if (!data) return null

  const status = STATUS[data.status]

  return (
    <div className="page">
      <h1>Mi membresía</h1>
      <div className="card">
        <p className="card__title">{data.plan_name}</p>
        <p>
          Estado: <Badge tone={status.tone}>{status.label}</Badge>
        </p>
        <p>Desde: {formatDate(data.start_date)}</p>
        <p>Hasta: {formatDate(data.end_date)}</p>
      </div>
    </div>
  )
}
