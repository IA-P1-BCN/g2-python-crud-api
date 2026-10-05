import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Pagination, Table, type Column } from '@/components/ui'
import { bookingsApi, classesApi, schedulesApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { dayLabel, formatTime } from '@/lib/format'
import type { ClassSchedule } from '@/types/api'

const PAGE_SIZE = 10

export function ClassesPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const queryClient = useQueryClient()

  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: 100 }),
  })

  const schedules = useQuery({
    queryKey: ['schedules', page],
    queryFn: () => schedulesApi.list({ page, size: PAGE_SIZE }),
  })

  const classNames = useMemo(
    () => new Map((classes.data?.items ?? []).map((item) => [item.id, item.name])),
    [classes.data],
  )

  const book = useMutation({
    mutationFn: (scheduleId: number) => {
      if (!user) throw new Error('Sesión no iniciada')
      return bookingsApi.create({
        member_id: user.id,
        schedule_id: scheduleId,
        booking_date: date,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const columns: Column<ClassSchedule>[] = [
    {
      key: 'class_id',
      header: 'Clase',
      render: (row) => classNames.get(row.class_id) ?? `Clase #${row.class_id}`,
    },
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
      key: 'actions',
      header: 'Acción',
      render: (row) => (
        <Button
          variant="primary"
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
        <label className="field">
          <span>Fecha de la reserva</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
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

      {schedules.data && schedules.data.pages > 1 ? (
        <Pagination page={page} pages={schedules.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
