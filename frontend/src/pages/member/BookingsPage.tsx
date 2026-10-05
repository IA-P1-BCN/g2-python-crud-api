import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Pagination, Table, type Column } from '@/components/ui'
import { bookingsApi, classesApi, schedulesApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { formatDate } from '@/lib/format'
import type { Booking } from '@/types/api'

const PAGE_SIZE = 10

export function BookingsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const bookings = useQuery({
    queryKey: ['bookings', user?.id, page],
    enabled: user !== null,
    queryFn: () => bookingsApi.listForUser(Number(user?.id), { page, size: PAGE_SIZE }),
  })

  const schedules = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: () => schedulesApi.list({ size: 100 }),
  })

  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: 100 }),
  })

  const { scheduleMap, classMap } = useMemo(
    () => ({
      scheduleMap: new Map((schedules.data?.items ?? []).map((item) => [item.id, item.class_id])),
      classMap: new Map((classes.data?.items ?? []).map((item) => [item.id, item.name])),
    }),
    [schedules.data, classes.data],
  )

  const cancel = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const columns: Column<Booking>[] = [
    {
      key: 'schedule_id',
      header: 'Clase',
      render: (row) => {
        const classId = scheduleMap.get(row.schedule_id)
        if (classId === undefined) return `Horario #${row.schedule_id}`
        return classMap.get(classId) ?? `Clase #${classId}`
      },
    },
    {
      key: 'booking_date',
      header: 'Fecha',
      render: (row) => formatDate(row.booking_date),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'confirmed' ? (
          <Badge tone="success">Confirmada</Badge>
        ) : (
          <Badge tone="neutral">Cancelada</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acción',
      render: (row) => (
        <Button
          variant="danger"
          disabled={row.status !== 'confirmed'}
          isLoading={cancel.isPending && cancel.variables === row.id}
          onClick={() => cancel.mutate(row.id)}
        >
          Cancelar
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page__header">
        <h1>Mis reservas</h1>
      </div>

      {cancel.isError ? <Alert variant="error">{toApiError(cancel.error).message}</Alert> : null}
      {bookings.isError ? (
        <Alert variant="error">{toApiError(bookings.error).message}</Alert>
      ) : null}

      <Table
        columns={columns}
        rows={bookings.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={bookings.isLoading}
        emptyMessage="Todavía no tienes reservas."
      />

      {bookings.data && bookings.data.pages > 1 ? (
        <Pagination page={page} pages={bookings.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
