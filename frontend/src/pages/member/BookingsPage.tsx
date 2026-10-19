import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, classesApi, schedulesApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { formatDate } from '@/lib/format'

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

  const classNames = useMemo(() => {
    const classById = new Map((classes.data?.items ?? []).map((item) => [item.id, item.name]))
    return new Map(
      (schedules.data?.items ?? []).map((schedule) => [
        schedule.id,
        classById.get(schedule.class_id) ?? `Clase #${schedule.class_id}`,
      ]),
    )
  }, [schedules.data, classes.data])

  const cancel = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const items = bookings.data?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Mis reservas</h1>
      </div>

      {cancel.isError ? <Alert variant="error">{toApiError(cancel.error).message}</Alert> : null}
      {bookings.isError ? (
        <Alert variant="error">{toApiError(bookings.error).message}</Alert>
      ) : null}

      {bookings.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}

      {!bookings.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">Todavía no tienes reservas.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((booking) => (
            <li key={booking.id} className="flex flex-col gap-2 rounded-card bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-title text-text">
                  {classNames.get(booking.schedule_id) ?? `Horario #${booking.schedule_id}`}
                </span>
                {booking.status === 'confirmed' ? (
                  <Badge tone="success">Confirmada</Badge>
                ) : (
                  <Badge tone="neutral">Cancelada</Badge>
                )}
              </div>
              <span className="text-small text-text-muted">{formatDate(booking.booking_date)}</span>
              <Button
                variant="danger"
                disabled={booking.status !== 'confirmed'}
                isLoading={cancel.isPending && cancel.variables === booking.id}
                onClick={() => cancel.mutate(booking.id)}
              >
                Cancelar
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {bookings.data && bookings.data.pages > 1 ? (
        <Pagination page={page} pages={bookings.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
