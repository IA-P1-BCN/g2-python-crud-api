import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi, toApiError } from '@/api'
import { Alert } from '@/components/ui/molecules/Alert'
import { DateRangeFilter } from '@/components/ui/molecules/DateRangeFilter'
import { StatCard } from '@/components/ui/molecules/StatCard'
import { BookingsByDayChart } from '@/components/ui/organisms/BookingsByDayChart'
import { ExpiringMembershipsList } from '@/components/ui/organisms/ExpiringMembershipsList'
import { OccupancyList } from '@/components/ui/organisms/OccupancyList'
import { PlansDistributionChart } from '@/components/ui/organisms/PlansDistributionChart'
import { TopClassesList } from '@/components/ui/organisms/TopClassesList'
import { TrainersSummaryCard } from '@/components/ui/organisms/TrainersSummaryCard'
import { formatDate, formatPercent, formatPrice } from '@/lib/format'
import type { DashboardPeriod } from '@/types/api'
import { useTrainersSummary } from './dashboard/useTrainersSummary'

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('7d')

  const dashboard = useQuery({
    queryKey: ['admin', 'dashboard', period],
    queryFn: () => adminApi.dashboard(period),
  })

  const trainers = useTrainersSummary()

  const data = dashboard.data

  return (
    <div className="flex flex-col gap-6">
      <div className="page__header">
        <h1 className="font-display text-display text-text">Resumen</h1>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {dashboard.isError ? (
        <Alert variant="error">{toApiError(dashboard.error).message}</Alert>
      ) : null}

      {dashboard.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}

      {data ? (
        <>
          <p className="text-small text-text-muted">
            Del {formatDate(data.period.start)} al {formatDate(data.period.end)}
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatCard label="Socios activos" value={data.members.active} />
            <StatCard label="Altas" value={data.members.signups} />
            <StatCard label="Bajas" value={data.members.sign_offs} />
            <StatCard label="Reservas" value={data.bookings.total} />
            <StatCard label="Ocupación media" value={formatPercent(data.occupancy.average_rate)} />
            <StatCard
              label="Facturación mensual estimada"
              value={formatPrice(data.plans.monthly_recurring_cents)}
              hint={`${data.plans.active_memberships} membresías en vigor`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <BookingsByDayChart days={data.bookings.by_day} />
            <ExpiringMembershipsList memberships={data.expiring_memberships} />
            <OccupancyList
              averageRate={data.occupancy.average_rate}
              classes={data.occupancy.by_class}
            />
            <PlansDistributionChart plans={data.plans.by_plan} />
            <TopClassesList classes={data.popular_classes} className="md:col-span-2" />
          </div>
        </>
      ) : null}

      <TrainersSummaryCard
        trainers={trainers.trainers}
        isLoading={trainers.isLoading}
        error={trainers.isError ? toApiError(trainers.error).message : null}
      />
    </div>
  )
}
