import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/atoms/Skeleton'
import { Alert } from '@/components/ui/molecules/Alert'
import { MembershipCard } from '@/components/ui/molecules/MembershipCard'
import { PlanBenefitsList } from '@/components/ui/molecules/PlanBenefitsList'
import { membershipPlansApi, membershipsApi, toApiError } from '@/api'
import { useAuth } from '@/auth'
import { utcDay, utcToday } from '@/lib/dates'
import { formatUtcDate } from '@/lib/format'
import type { Membership } from '@/types/api'

const DAY_MS = 86_400_000

/** Days left until the end date, never below zero. */
function daysLeft(membership: Membership): number {
  return Math.max(0, Math.ceil((utcDay(membership.end_date) - utcToday()) / DAY_MS))
}

/** Full length of the membership in days, for the progress bar. */
function totalDays(membership: Membership): number {
  return Math.round((utcDay(membership.end_date) - utcDay(membership.start_date)) / DAY_MS)
}

export function MembershipPage() {
  const { user } = useAuth()

  const memberships = useQuery({
    queryKey: ['memberships', user?.id],
    enabled: user !== null,
    queryFn: () => membershipsApi.listForUser(Number(user?.id), { size: 10 }),
  })

  const plans = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => membershipPlansApi.list({ size: 100 }),
  })

  const membership = memberships.data?.items[0]
  const plan = plans.data?.items.find((item) => item.id === membership?.plan_id)

  let body: ReactNode

  if (memberships.isLoading) {
    body = (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-44 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
      </div>
    )
  } else if (memberships.isError) {
    body = <Alert variant="error">{toApiError(memberships.error).message}</Alert>
  } else if (!membership) {
    body = <Alert variant="info">No tienes ninguna membresía asignada.</Alert>
  } else if (plans.isLoading) {
    // Only the card needs the plan name: keep it out of view until the lookup resolves, so the
    // fallback "Plan #<id>" never flashes on screen. A failed query falls through to the fallback.
    body = (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-44 rounded-card" />
        <PlanBenefitsList title="Tu plan incluye" />
      </div>
    )
  } else {
    body = (
      <>
        <MembershipCard
          planName={plan?.name ?? `Plan #${membership.plan_id}`}
          status={membership.status}
          endDate={formatUtcDate(membership.end_date)}
          daysLeft={daysLeft(membership)}
          totalDays={totalDays(membership)}
        />
        <PlanBenefitsList title="Tu plan incluye" />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-headline text-text">Mi membresía</h1>
      {body}
    </div>
  )
}
