import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Badge, Button, Pagination, Table, type Column } from '@/components/ui'
import { bookingsApi, schedulesApi, toApiError } from '@/api'
import { dayLabel, formatTime } from '@/lib/format'
import type { ClassSchedule } from '@/types/schema'

const PAGE_SIZE = 10

export function ClassesPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const schedules = useQuery({
    queryKey: ['schedules', page],
    queryFn: () => schedulesApi.list({ page, size: PAGE_SIZE }),
  })

  const book = useMutation({
    mutationFn: (scheduleId: number) => bookingsApi.create({ schedule_id: scheduleId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['schedules'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const columns: Column<ClassSchedule>[] = [
    { key: 'class_name', header: 'Clase' },
    {
      key: 'day_of_week',
      header: 'Día',
      render: (row) => dayLabel(row.day_of_week),
    },
    {
      key: 'start_time',
      header: 'Horario',
      render: (row) => `${formatTime(row.start_time)} – ${formatTime(row.end_time)}`,
    },
    {
      key: 'remaining_spots',
      header: 'Plazas',
      render: (row) =>
        row.remaining_spots > 0 ? (
          `${row.remaining_spots} de ${row.capacity}`
        ) : (
          <Badge tone="danger">Completa</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acción',
      render: (row) => (
        <Button
          variant="primary"
          disabled={row.remaining_spots <= 0}
          isLoading={book.isPending && book.variables === row.id}
          onClick={() => book.mutate(row.id)}
        >
          Reservar
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page__header">
        <h1>Clases y horarios</h1>
      </div>

      {book.isError ? <Alert variant="error">{toApiError(book.error).message}</Alert> : null}
      {book.isSuccess ? <Alert variant="success">Reserva confirmada.</Alert> : null}
      {schedules.isError ? (
        <Alert variant="error">{toApiError(schedules.error).message}</Alert>
      ) : null}

      <Table
        columns={columns}
        rows={schedules.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={schedules.isLoading}
        emptyMessage="No hay clases disponibles."
      />

      {schedules.data && schedules.data.meta.pages > 1 ? (
        <Pagination page={page} pages={schedules.data.meta.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
