import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Alert } from '@/components/ui/molecules/Alert'
import { NextBookingCard, type NextBooking } from '@/components/ui/molecules/NextBookingCard'
import { QuickAccessGrid, type QuickAccessItem } from '@/components/ui/organisms/QuickAccessGrid'
import { formatDate, formatTime } from '@/lib/format'
import { useMemberDashboard } from './useMemberDashboard'

const QUICK_ACCESS: QuickAccessItem[] = [
  { icon: 'calendar', label: 'Reservas', to: '/member/bookings' },
  { icon: 'dumbbell', label: 'Mi plan', to: '/member/membership' },
  { icon: 'calendar-plus', label: 'Clases', to: '/member/classes' },
  { icon: 'settings', label: 'Mi perfil', to: '/member/profile' },
]

export function MemberHomePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { dashboard, isLoading, isError, error } = useMemberDashboard()

  const cancel = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['member', 'dashboard'] }),
  })

  const next = dashboard?.upcoming_bookings[0]
  const nextBooking: NextBooking | null = next
    ? {
        id: next.booking_id,
        className: next.class_name,
        date: formatDate(next.booking_date),
        time: `${formatTime(next.start_time)} – ${formatTime(next.end_time)}`,
        room: next.room_name,
        trainer: next.trainer_name,
      }
    : null

  const membership = dashboard?.membership

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-headline text-text">Hola, {user?.full_name ?? 'socio'}</h1>
        <p className="text-body text-text-muted">Esto es lo que tienes por delante.</p>
      </div>

      {isError ? <Alert variant="error">{toApiError(error).message}</Alert> : null}
      {cancel.isError ? <Alert variant="error">{toApiError(cancel.error).message}</Alert> : null}

      <section
        className="flex flex-col gap-2 rounded-card bg-surface p-6"
        aria-label="Mi membresía"
      >
        <h2 className="font-display text-title text-text">Mi membresía</h2>
        {isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
        {!isLoading && membership ? (
          <p className="text-body text-text-soft">
            Plan <strong>{membership.plan_name}</strong> · {membership.days_left} días restantes
          </p>
        ) : null}
        {!isLoading && !membership ? (
          <p className="text-body text-text-muted">Sin membresía activa.</p>
        ) : null}
      </section>

      {isLoading ? null : (
        <NextBookingCard
          booking={nextBooking}
          onCancel={(id) => cancel.mutate(id)}
          isCancelling={cancel.isPending}
        />
      )}

      <QuickAccessGrid items={QUICK_ACCESS} />
    </div>
  )
}
