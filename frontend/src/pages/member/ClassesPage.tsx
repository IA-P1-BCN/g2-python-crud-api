import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/Button'
import { Badge } from '@/components/ui/atoms/Badge'
import { Alert } from '@/components/ui/molecules/Alert'
import { Table, type Column } from '@/components/ui/organisms/Table'
import { bookingsApi, classesApi, roomsApi, schedulesApi, toApiError, usersApi } from '@/api'
import { useAuth } from '@/auth'
import { dayLabel, formatDate, formatTime } from '@/lib/format'
import type { ClassSchedule } from '@/types/api'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const PAGE_SIZE = 100

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Next calendar date (today included) that falls on the given backend weekday (0 = Monday). */
function nextDateForWeekday(weekday: number): string {
  const today = new Date()
  const todayWeekday = (today.getDay() + 6) % 7
  const target = new Date(today)
  target.setDate(today.getDate() + ((weekday - todayWeekday + 7) % 7))
  return toLocalIsoDate(target)
}

export function ClassesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [weekday, setWeekday] = useState(() => (new Date().getDay() + 6) % 7)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const date = useMemo(() => nextDateForWeekday(weekday), [weekday])

  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: PAGE_SIZE }),
  })
  const schedules = useQuery({
    queryKey: ['schedules', weekday],
    queryFn: () => schedulesApi.list({ day_of_week: weekday, size: PAGE_SIZE }),
  })
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => roomsApi.list({ size: PAGE_SIZE }) })
  const users = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list({ size: PAGE_SIZE }) })
  const bookings = useQuery({
    queryKey: ['calendar-bookings', date],
    queryFn: () => bookingsApi.list({ on_date: date, size: 200 }),
  })

  const classMap = useMemo(
    () => new Map((classes.data?.items ?? []).map((item) => [item.id, item])),
    [classes.data],
  )
  const roomMap = useMemo(
    () => new Map((rooms.data?.items ?? []).map((item) => [item.id, item.name])),
    [rooms.data],
  )
  const trainerMap = useMemo(
    () => new Map((users.data?.items ?? []).map((item) => [item.id, item.full_name])),
    [users.data],
  )

  const dayBookings = useMemo(() => bookings.data?.items ?? [], [bookings.data])
  const confirmedBySchedule = useMemo(() => {
    const counts = new Map<number, number>()
    for (const booking of dayBookings) {
      if (booking.status === 'confirmed') {
        counts.set(booking.schedule_id, (counts.get(booking.schedule_id) ?? 0) + 1)
      }
    }
    return counts
  }, [dayBookings])

  const myBookingBySchedule = useMemo(() => {
    const map = new Map<number, number>()
    for (const booking of dayBookings) {
      if (booking.member_id === user?.id && booking.status === 'confirmed') {
        map.set(booking.schedule_id, booking.id)
      }
    }
    return map
  }, [dayBookings, user?.id])

  const sessions = useMemo(
    () =>
      [...(schedules.data?.items ?? [])].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [schedules.data],
  )

  const selected = sessions.find((session) => session.id === selectedId) ?? null

  const book = useMutation({
    mutationFn: (scheduleId: number) => {
      if (!user) throw new Error('Sesión no iniciada')
      return bookingsApi.create({
        member_id: user.id,
        schedule_id: scheduleId,
        booking_date: date,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-bookings', date] }),
  })

  const cancel = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-bookings', date] }),
  })

  const capacityFor = (session: ClassSchedule) => classMap.get(session.class_id)?.capacity ?? 0
  const availableFor = (session: ClassSchedule) =>
    Math.max(capacityFor(session) - (confirmedBySchedule.get(session.id) ?? 0), 0)

  function selectSession(id: number) {
    setSelectedId(id)
    book.reset()
    cancel.reset()
  }

  function selectWeekday(day: number) {
    setWeekday(day)
    setSelectedId(null)
    book.reset()
    cancel.reset()
  }

  const columns: Column<ClassSchedule>[] = [
    {
      key: 'class',
      header: 'Clase',
      render: (session) => classMap.get(session.class_id)?.name ?? `Clase #${session.class_id}`,
    },
    {
      key: 'trainer',
      header: 'Instructor',
      render: (session) => {
        const trainerId = classMap.get(session.class_id)?.trainer_id
        return trainerId === undefined || trainerId === null
          ? '—'
          : (trainerMap.get(trainerId) ?? `Entrenador #${trainerId}`)
      },
    },
    {
      key: 'room',
      header: 'Sala',
      render: (session) =>
        session.room_id ? (roomMap.get(session.room_id) ?? `Sala #${session.room_id}`) : '—',
    },
    {
      key: 'time',
      header: 'Hora',
      render: (session) => `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`,
    },
    {
      key: 'spots',
      header: 'Plazas',
      render: (session) =>
        availableFor(session) > 0 ? (
          `${availableFor(session)} libres`
        ) : (
          <Badge tone="danger">Completa</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (session) => (
        <Button
          variant={session.id === selected?.id ? 'secondary' : 'ghost'}
          disabled={session.id === selected?.id}
          onClick={() => selectSession(session.id)}
        >
          Ver detalle
        </Button>
      ),
    },
  ]

  const selectedCapacity = selected ? capacityFor(selected) : 0
  const selectedOccupied = selected ? (confirmedBySchedule.get(selected.id) ?? 0) : 0
  const selectedAvailable = selected ? availableFor(selected) : 0
  const myBookingId = selected ? myBookingBySchedule.get(selected.id) : undefined

  return (
    <div className="page">
      <div className="page__header">
        <h1>Calendario de clases</h1>
        <span className="card__meta">Semana del {formatDate(date)}</span>
      </div>

      <div className="weekdays" role="tablist" aria-label="Día de la semana">
        {WEEKDAYS.map((day) => (
          <Button
            key={day}
            variant={day === weekday ? 'primary' : 'secondary'}
            aria-pressed={day === weekday}
            onClick={() => selectWeekday(day)}
          >
            {dayLabel(day)}
          </Button>
        ))}
      </div>

      {schedules.isError ? (
        <Alert variant="error">{toApiError(schedules.error).message}</Alert>
      ) : null}

      <Table
        columns={columns}
        rows={sessions}
        rowKey={(session) => session.id}
        isLoading={schedules.isLoading || classes.isLoading}
        emptyMessage="No hay sesiones para este día."
      />

      <section className="members">
        <h2>Detalle de la sesión</h2>

        {!selected ? (
          <p className="table-status">Selecciona una sesión para ver su detalle.</p>
        ) : (
          <div className="card session-detail">
            <p className="card__title">
              {classMap.get(selected.class_id)?.name ?? `Clase #${selected.class_id}`}
            </p>
            <p>
              Instructor: {trainerMap.get(classMap.get(selected.class_id)?.trainer_id ?? -1) ?? '—'}{' '}
              · Sala:{' '}
              {selected.room_id
                ? (roomMap.get(selected.room_id) ?? `Sala #${selected.room_id}`)
                : '—'}
            </p>
            <p>
              {dayLabel(selected.day_of_week)} {formatDate(date)} ·{' '}
              {formatTime(selected.start_time)}–{formatTime(selected.end_time)}
            </p>
            <p>
              Plazas: {selectedOccupied} de {selectedCapacity} ocupadas ·{' '}
              {selectedAvailable > 0 ? (
                <Badge tone="success">{selectedAvailable} libres</Badge>
              ) : (
                <Badge tone="danger">Completa</Badge>
              )}
            </p>

            {book.isError ? <Alert variant="error">{toApiError(book.error).message}</Alert> : null}
            {cancel.isError ? (
              <Alert variant="error">{toApiError(cancel.error).message}</Alert>
            ) : null}
            {book.isSuccess ? <Alert variant="success">Reserva confirmada.</Alert> : null}
            {cancel.isSuccess ? <Alert variant="success">Reserva cancelada.</Alert> : null}

            <div className="session-detail__actions">
              {myBookingId !== undefined ? (
                <>
                  <Badge tone="info">Ya reservada</Badge>
                  <Button
                    variant="danger"
                    isLoading={cancel.isPending}
                    onClick={() => cancel.mutate(myBookingId)}
                  >
                    Cancelar reserva
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  disabled={selectedAvailable <= 0}
                  isLoading={book.isPending}
                  onClick={() => book.mutate(selected.id)}
                >
                  Reservar
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
