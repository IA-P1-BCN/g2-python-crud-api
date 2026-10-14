import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { cn } from '@/lib/cn'

export type BookingState = 'available' | 'booked' | 'full'

export type BookingActionBarProps = {
  state: BookingState
  onBook?: () => void
  onCancel?: () => void
  isBooking?: boolean
  isCancelling?: boolean
  /** Booking-rule error shown in an Alert. */
  error?: string | null
  /** Success message shown in an Alert. */
  message?: string | null
  className?: string
}

export function BookingActionBar({
  state,
  onBook,
  onCancel,
  isBooking = false,
  isCancelling = false,
  error = null,
  message = null,
  className,
}: BookingActionBarProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      {state === 'booked' ? (
        <Button variant="danger" isLoading={isCancelling} onClick={onCancel}>
          Cancelar reserva
        </Button>
      ) : state === 'full' ? (
        <Button variant="secondary" disabled>
          Sin plazas
        </Button>
      ) : (
        <Button variant="primary" isLoading={isBooking} onClick={onBook}>
          Reservar
        </Button>
      )}
    </div>
  )
}
