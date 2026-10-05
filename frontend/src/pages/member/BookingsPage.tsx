import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Pagination, Table, type Column } from '@/components/ui'
import { bookingsApi, toApiError } from '@/api'
import { formatDateTime } from '@/lib/format'
import type { Booking } from '@/types/schema'

const PAGE_SIZE = 10

export function BookingsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const bookings = useQuery({
    queryKey: ['bookings', page],
    queryFn: () => bookingsApi.listMine({ page, size: PAGE_SIZE }),
  })

  const cancel = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })

  const columns: Column<Booking>[] = [
    { key: 'class_name', header: 'Clase' },
    {
      key: 'starts_at',
      header: 'Fecha',
      render: (row) => formatDateTime(row.starts_at),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'active' ? (
          <Badge tone="success">Activa</Badge>
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
          disabled={row.status !== 'active'}
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

      {bookings.data && bookings.data.meta.pages > 1 ? (
        <Pagination page={page} pages={bookings.data.meta.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
