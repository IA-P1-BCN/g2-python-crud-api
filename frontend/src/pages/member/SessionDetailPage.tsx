import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Alert } from '@/components/ui/molecules/Alert'
import { SessionHero } from '@/components/ui/molecules/SessionHero'
import { BookingActionBar } from '@/components/ui/organisms/BookingActionBar'
import { toIsoDate } from '@/lib/dates'
import { useSessionDetail } from './useSessionDetail'

export function SessionDetailPage() {
  const { scheduleId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const id = Number(scheduleId)
  const date = searchParams.get('date') ?? toIsoDate(new Date())

  const { detail, isLoading, isError, error } = useSessionDetail(Number.isNaN(id) ? null : id, date)

  const book = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Sesión no iniciada')
      return bookingsApi.create({ member_id: user.id, schedule_id: id, booking_date: date })
    },
    onSuccess: () => invalidate(),
  })

  const cancel = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => invalidate(),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['session-bookings', id, date] })
    queryClient.invalidateQueries({ queryKey: ['member-sessions-bookings'] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const actionError = book.isError
    ? toApiError(book.error).message
    : cancel.isError
      ? toApiError(cancel.error).message
      : null
  const actionMessage = book.isSuccess
    ? 'Reserva confirmada.'
    : cancel.isSuccess
      ? 'Reserva cancelada.'
      : null

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Detalles de la sesión</h1>
        <Link to="/member/classes" className="text-small text-text-muted">
          ← Volver
        </Link>
      </div>

      {isError ? <Alert variant="error">{toApiError(error).message}</Alert> : null}
      {isLoading && !detail ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!isLoading && !detail && !isError ? (
        <p className="text-body text-text-muted">Sesión no encontrada.</p>
      ) : null}

      {detail ? (
        <>
          <SessionHero
            title={detail.title}
            date={detail.date}
            time={detail.time}
            trainerName={detail.trainerName}
            room={detail.room}
            enrolled={detail.enrolled}
            capacity={detail.capacity}
          />
          <BookingActionBar
            state={detail.state}
            onBook={() => book.mutate()}
            onCancel={() => {
              if (detail.bookingId !== null) cancel.mutate(detail.bookingId)
            }}
            isBooking={book.isPending}
            isCancelling={cancel.isPending}
            error={actionError}
            message={actionMessage}
          />
        </>
      ) : null}
    </div>
  )
}
