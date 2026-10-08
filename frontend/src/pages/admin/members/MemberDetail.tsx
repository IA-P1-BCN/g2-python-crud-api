import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Table, type Column } from '@/components/ui'
import { bookingsApi, membershipsApi, toApiError } from '@/api'
import { formatDate } from '@/lib/format'
import type { Booking, Membership, User } from '@/types/api'
import { UserStatusBadge } from '../users/UserStatusBadge'

const MEMBERSHIP_STATUS: Record<Membership['status'], string> = {
  active: 'Activa',
  expired: 'Caducada',
  cancelled: 'Cancelada',
}

const BOOKING_STATUS: Record<Booking['status'], string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const membershipColumns: Column<Membership>[] = [
  { key: 'plan_id', header: 'Plan', render: (row) => `Plan #${row.plan_id}` },
  { key: 'start_date', header: 'Desde', render: (row) => formatDate(row.start_date) },
  { key: 'end_date', header: 'Hasta', render: (row) => formatDate(row.end_date) },
  { key: 'status', header: 'Estado', render: (row) => MEMBERSHIP_STATUS[row.status] },
]

const bookingColumns: Column<Booking>[] = [
  { key: 'booking_date', header: 'Fecha', render: (row) => formatDate(row.booking_date) },
  { key: 'schedule_id', header: 'Horario', render: (row) => `#${row.schedule_id}` },
  { key: 'status', header: 'Estado', render: (row) => BOOKING_STATUS[row.status] },
]

type MemberDetailProps = {
  member: User
  onClose: () => void
}

export function MemberDetail({ member, onClose }: MemberDetailProps) {
  const memberships = useQuery({
    queryKey: ['users', member.id, 'memberships'],
    queryFn: () => membershipsApi.listForUser(member.id, { size: 100 }),
  })
  const bookings = useQuery({
    queryKey: ['users', member.id, 'bookings'],
    queryFn: () => bookingsApi.listForUser(member.id, { size: 100 }),
  })

  return (
    <section className="card" aria-label={`Ficha de ${member.full_name}`}>
      <div className="page__header">
        <h2 className="card__title">{member.full_name}</h2>
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <p className="card__meta">
        {member.email} · Alta el {formatDate(member.created_at)} · <UserStatusBadge user={member} />
      </p>

      <h3>Membresías</h3>
      {memberships.isError ? (
        <Alert variant="error">{toApiError(memberships.error).message}</Alert>
      ) : null}
      <Table
        columns={membershipColumns}
        rows={memberships.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={memberships.isLoading}
        emptyMessage="Sin membresías."
      />

      <h3>Reservas</h3>
      {bookings.isError ? (
        <Alert variant="error">{toApiError(bookings.error).message}</Alert>
      ) : null}
      <Table
        columns={bookingColumns}
        rows={bookings.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={bookings.isLoading}
        emptyMessage="Sin reservas."
      />
    </section>
  )
}
