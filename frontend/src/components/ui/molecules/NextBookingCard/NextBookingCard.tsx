import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type NextBooking = {
  id: number
  className: string
  /** Already formatted date. */
  date: string
  /** Already formatted time range, e.g. "10:00 – 11:00". */
  time: string
  room: string | null
  trainer: string
}

export type NextBookingCardProps = {
  booking: NextBooking | null
  onCancel?: (id: number) => void
  isCancelling?: boolean
  /** Link shown in the empty state. */
  bookingsHref?: string
  className?: string
}

export function NextBookingCard({
  booking,
  onCancel,
  isCancelling = false,
  bookingsHref = '/member/bookings',
  className,
}: NextBookingCardProps) {
  return (
    <section
      className={cn('flex flex-col gap-2 rounded-card bg-secondary p-6 text-white', className)}
      aria-label="Próxima reserva"
    >
      <h2 className="font-display text-title">Tu próxima reserva</h2>

      {booking ? (
        <>
          <p className="font-display text-headline">{booking.className}</p>
          <p className="text-body text-white/90">
            {booking.date} · {booking.time}
            {booking.room ? ` · ${booking.room}` : ''}
          </p>
          <p className="text-small text-white/80">Entrenador: {booking.trainer}</p>
          <button
            type="button"
            className="mt-2 self-start rounded-full border border-white/40 px-4 py-2 font-display text-body"
            disabled={isCancelling}
            onClick={() => onCancel?.(booking.id)}
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar reserva'}
          </button>
        </>
      ) : (
        <>
          <p className="text-body text-white/90">No tienes reservas próximas.</p>
          <Link to={bookingsHref} className="self-start font-display text-body underline">
            Ver clases y reservar
          </Link>
        </>
      )}
    </section>
  )
}
