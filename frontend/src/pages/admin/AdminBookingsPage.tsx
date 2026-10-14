import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, classesApi, schedulesApi, toApiError, usersApi } from '@/api'
import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { formatDate, formatTime } from '@/lib/format'
import type { BookingStatus } from '@/types/api'

const PAGE_SIZE = 10
const SELECT_CLASS =
  'w-full rounded-full border border-white/10 bg-surface-sunken px-4 py-3 text-body text-text outline-none focus-visible:border-primary'

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

type BookingForm = { member_id: string; schedule_id: string; booking_date: string }

function emptyForm(): BookingForm {
  return {
    member_id: '',
    schedule_id: '',
    booking_date: new Date().toISOString().slice(0, 10),
  }
}

export function AdminBookingsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [memberId, setMemberId] = useState('')
  const [onDate, setOnDate] = useState('')
  const [form, setForm] = useState<BookingForm | null>(null)

  const members = useQuery({
    queryKey: ['users', 'members'],
    queryFn: () => usersApi.list({ role: 'member', size: 100 }),
  })
  const schedules = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: () => schedulesApi.list({ size: 100 }),
  })
  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: 100 }),
  })

  const bookings = useQuery({
    queryKey: ['bookings', 'admin', { page, status, memberId, onDate }],
    queryFn: () =>
      bookingsApi.list({
        page,
        size: PAGE_SIZE,
        status_filter: status || undefined,
        member_id: memberId ? Number(memberId) : undefined,
        on_date: onDate || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['bookings'] })

  const create = useMutation({
    mutationFn: (data: BookingForm) =>
      bookingsApi.create({
        member_id: Number(data.member_id),
        schedule_id: Number(data.schedule_id),
        booking_date: data.booking_date,
      }),
    onSuccess: () => {
      setForm(null)
      refresh()
    },
  })

  const cancel = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: refresh,
  })

  function handleCancel(id: number) {
    if (window.confirm('¿Cancelar esta reserva?')) {
      cancel.mutate(id)
    }
  }

  const classNames = new Map((classes.data?.items ?? []).map((item) => [item.id, item.name]))
  const scheduleLabel = (id: number) => {
    const schedule = (schedules.data?.items ?? []).find((item) => item.id === id)
    if (!schedule) return `Horario #${id}`
    return `${classNames.get(schedule.class_id) ?? `Clase #${schedule.class_id}`} · ${formatTime(
      schedule.start_time,
    )}`
  }
  const memberName = (id: number) =>
    (members.data?.items ?? []).find((user) => user.id === id)?.full_name ?? `Socio #${id}`

  const items = bookings.data?.items ?? []
  const canSave =
    form !== null && form.member_id !== '' && form.schedule_id !== '' && form.booking_date

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Reservas</h1>
        <Button onClick={() => setForm(emptyForm())}>Nueva reserva</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Estado
          <select
            className={SELECT_CLASS}
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value as BookingStatus | '')
            }}
          >
            <option value="">Todas</option>
            {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((value) => (
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
            value={memberId}
            onChange={(event) => {
              setPage(1)
              setMemberId(event.target.value)
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
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Fecha
          <Input
            type="date"
            value={onDate}
            onChange={(event) => {
              setPage(1)
              setOnDate(event.target.value)
            }}
          />
        </label>
      </div>

      {cancel.isError ? <Alert variant="error">{toApiError(cancel.error).message}</Alert> : null}
      {bookings.isError ? (
        <Alert variant="error">{toApiError(bookings.error).message}</Alert>
      ) : null}

      {form ? (
        <form
          className="flex flex-col gap-3 rounded-card bg-surface p-4"
          aria-label="Nueva reserva"
          onSubmit={(event) => {
            event.preventDefault()
            if (canSave) create.mutate(form)
          }}
        >
          {create.isError ? (
            <Alert variant="error">{toApiError(create.error).message}</Alert>
          ) : null}
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Socio
            <select
              className={SELECT_CLASS}
              value={form.member_id}
              onChange={(event) => setForm({ ...form, member_id: event.target.value })}
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
            Horario
            <select
              className={SELECT_CLASS}
              value={form.schedule_id}
              onChange={(event) => setForm({ ...form, schedule_id: event.target.value })}
              required
            >
              <option value="">Elige un horario</option>
              {(schedules.data?.items ?? []).map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {scheduleLabel(schedule.id)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Fecha
            <Input
              type="date"
              value={form.booking_date}
              onChange={(event) => setForm({ ...form, booking_date: event.target.value })}
              required
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" isLoading={create.isPending} disabled={!canSave}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {bookings.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!bookings.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay reservas con estos filtros.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-4"
            >
              <div className="flex flex-col">
                <span className="font-display text-title text-text">
                  {memberName(booking.member_id)}
                </span>
                <span className="text-small text-text-muted">
                  {scheduleLabel(booking.schedule_id)} · {formatDate(booking.booking_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {booking.status === 'confirmed' ? (
                  <Badge tone="success">Confirmada</Badge>
                ) : (
                  <Badge tone="neutral">Cancelada</Badge>
                )}
                <Button
                  variant="danger"
                  disabled={booking.status !== 'confirmed'}
                  isLoading={cancel.isPending && cancel.variables === booking.id}
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancelar
                </Button>
              </div>
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
