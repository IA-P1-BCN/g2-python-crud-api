import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { SessionList } from '@/components/ui/organisms/SessionList'
import { WeekSelector } from '@/components/ui/organisms/WeekSelector'
import { toIsoDate } from '@/lib/dates'
import { formatDate } from '@/lib/format'
import { useMemberSessions, type MemberSession } from './useMemberSessions'

export function ClassesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()))
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { sessions, sessionDates, isLoading, isError, error } = useMemberSessions(selectedDate)
  const selected = sessions.find((session) => session.id === selectedId) ?? null

  const book = useMutation({
    mutationFn: (scheduleId: number) => {
      if (!user) throw new Error('Sesión no iniciada')
      return bookingsApi.create({
        member_id: user.id,
        schedule_id: scheduleId,
        booking_date: selectedDate,
      })
    },
    onSuccess: () => invalidateBookings(),
  })

  const cancel = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => invalidateBookings(),
  })

  function invalidateBookings() {
    queryClient.invalidateQueries({ queryKey: ['member-sessions-bookings', selectedDate] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  function handleSelectDate(isoDate: string) {
    setSelectedDate(isoDate)
    setSelectedId(null)
    book.reset()
    cancel.reset()
  }

  function selectSession(session: MemberSession) {
    setSelectedId(session.id)
    book.reset()
    cancel.reset()
  }

  const items = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    time: session.time,
    room: session.room,
    enrolled: session.enrolled,
    capacity: session.capacity,
    state: session.state,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Reservas</h1>
        <span className="text-small text-text-muted">Semana del {formatDate(selectedDate)}</span>
      </div>

      <WeekSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        sessionDates={sessionDates}
      />

      <SessionList
        sessions={items}
        role="member"
        isLoading={isLoading}
        error={isError ? toApiError(error).message : null}
        emptyMessage="No hay sesiones para este día."
        onAction={(id) => {
          const session = sessions.find((item) => item.id === id)
          if (session) selectSession(session)
        }}
      />

      {selected ? (
        <section
          className="flex flex-col gap-2 rounded-card bg-surface p-6"
          aria-label="Detalles de la sesión"
        >
          <h2 className="font-display text-title text-text">{selected.title}</h2>
          <p className="text-body text-text-soft">
            Instructor: {selected.trainerName} · Sala: {selected.room}
          </p>
          <p className="text-body text-text-soft">
            {formatDate(selectedDate)} · {selected.time}
          </p>
          <p className="text-body text-text-soft">
            Plazas: {selected.enrolled} de {selected.capacity} ocupadas · {selected.available}{' '}
            libres
          </p>

          {book.isError ? <Alert variant="error">{toApiError(book.error).message}</Alert> : null}
          {cancel.isError ? (
            <Alert variant="error">{toApiError(cancel.error).message}</Alert>
          ) : null}
          {book.isSuccess ? <Alert variant="success">Reserva confirmada.</Alert> : null}
          {cancel.isSuccess ? <Alert variant="success">Reserva cancelada.</Alert> : null}

          <div className="flex items-center gap-2 pt-1">
            {selected.bookingId !== null ? (
              <>
                <Badge tone="info">Ya reservada</Badge>
                <Button
                  variant="danger"
                  isLoading={cancel.isPending}
                  onClick={() => cancel.mutate(selected.bookingId as number)}
                >
                  Cancelar reserva
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                disabled={selected.available <= 0}
                isLoading={book.isPending}
                onClick={() => book.mutate(selected.id)}
              >
                Reservar
              </Button>
            )}
          </div>
        </section>
      ) : (
        <p className="text-body text-text-muted">Selecciona una sesión para ver su detalle.</p>
      )}
    </div>
  )
}
