import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Table, type Column } from '@/components/ui'
import { adminApi, toApiError } from '@/api'
import { formatDate, formatPrice } from '@/lib/format'
import type {
  ClassOccupancy,
  DailyBookings,
  DashboardPeriod,
  ExpiringMembership,
  PlanShare,
  PopularClass,
  WeeklyMovement,
} from '@/types/api'

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
]

function percent(rate: number): string {
  return `${Math.round(rate * 100)} %`
}

const weekColumns: Column<WeeklyMovement>[] = [
  {
    key: 'start',
    header: 'Semana',
    render: (row) => `${formatDate(row.start)} – ${formatDate(row.end)}`,
  },
  { key: 'signups', header: 'Altas' },
  { key: 'sign_offs', header: 'Bajas' },
]

const dayColumns: Column<DailyBookings>[] = [
  { key: 'day', header: 'Día', render: (row) => formatDate(row.day) },
  { key: 'count', header: 'Reservas' },
]

const occupancyColumns: Column<ClassOccupancy>[] = [
  { key: 'name', header: 'Clase' },
  { key: 'booked', header: 'Plazas', render: (row) => `${row.booked} / ${row.capacity}` },
  { key: 'rate', header: 'Ocupación', render: (row) => percent(row.rate) },
]

const expiringColumns: Column<ExpiringMembership>[] = [
  { key: 'full_name', header: 'Socio' },
  { key: 'plan_name', header: 'Plan' },
  { key: 'end_date', header: 'Vence', render: (row) => formatDate(row.end_date) },
  {
    key: 'days_left',
    header: 'Quedan',
    render: (row) => (row.days_left === 1 ? '1 día' : `${row.days_left} días`),
  },
]

const planColumns: Column<PlanShare>[] = [
  { key: 'name', header: 'Plan' },
  { key: 'price_cents', header: 'Precio', render: (row) => formatPrice(row.price_cents) },
  { key: 'members', header: 'Socios' },
  { key: 'share', header: 'Reparto', render: (row) => percent(row.share) },
]

const popularColumns: Column<PopularClass>[] = [
  { key: 'name', header: 'Clase' },
  { key: 'bookings', header: 'Reservas' },
]

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('7d')

  const dashboard = useQuery({
    queryKey: ['admin', 'dashboard', period],
    queryFn: () => adminApi.dashboard(period),
  })

  const data = dashboard.data

  return (
    <div className="page">
      <div className="page__header">
        <h1>Resumen</h1>
        <div className="form__actions" role="group" aria-label="Periodo">
          {PERIODS.map((option) => (
            <Button
              key={option.value}
              variant={option.value === period ? 'primary' : 'secondary'}
              aria-pressed={option.value === period}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {dashboard.isError ? (
        <Alert variant="error">{toApiError(dashboard.error).message}</Alert>
      ) : null}

      {dashboard.isLoading ? <p className="table-status">Cargando…</p> : null}

      {data ? (
        <>
          <p className="card__meta">
            Del {formatDate(data.period.start)} al {formatDate(data.period.end)}
          </p>

          <div className="cards">
            <article className="card">
              <h2 className="card__title">Socios activos</h2>
              <p className="stat">{data.members.active}</p>
            </article>
            <article className="card">
              <h2 className="card__title">Altas</h2>
              <p className="stat">{data.members.signups}</p>
            </article>
            <article className="card">
              <h2 className="card__title">Bajas</h2>
              <p className="stat">{data.members.sign_offs}</p>
            </article>
            <article className="card">
              <h2 className="card__title">Reservas</h2>
              <p className="stat">{data.bookings.total}</p>
            </article>
            <article className="card">
              <h2 className="card__title">Ocupación media</h2>
              <p className="stat">{percent(data.occupancy.average_rate)}</p>
            </article>
            <article className="card">
              <h2 className="card__title">Facturación mensual estimada</h2>
              <p className="stat">{formatPrice(data.plans.monthly_recurring_cents)}</p>
              <p className="card__meta">{data.plans.active_memberships} membresías en vigor</p>
            </article>
          </div>

          <section className="card">
            <h2 className="card__title">Membresías que vencen en 7 días</h2>
            <Table
              columns={expiringColumns}
              rows={data.expiring_memberships}
              rowKey={(row) => row.membership_id}
              emptyMessage="Ninguna membresía vence en los próximos 7 días."
            />
          </section>

          <section className="card">
            <h2 className="card__title">Altas y bajas por semana</h2>
            <Table columns={weekColumns} rows={data.weekly_movements} rowKey={(row) => row.start} />
          </section>

          <section className="card">
            <h2 className="card__title">Reservas por día</h2>
            <Table columns={dayColumns} rows={data.bookings.by_day} rowKey={(row) => row.day} />
          </section>

          <section className="card">
            <h2 className="card__title">Ocupación de clases</h2>
            <Table
              columns={occupancyColumns}
              rows={data.occupancy.by_class}
              rowKey={(row) => row.class_id}
              emptyMessage="No hay sesiones en este periodo."
            />
          </section>

          <section className="card">
            <h2 className="card__title">Planes más contratados</h2>
            <Table
              columns={planColumns}
              rows={data.plans.by_plan}
              rowKey={(row) => row.plan_id}
              emptyMessage="No hay membresías en vigor."
            />
          </section>

          <section className="card">
            <h2 className="card__title">Clases más populares</h2>
            <Table
              columns={popularColumns}
              rows={data.popular_classes}
              rowKey={(row) => row.class_id}
              emptyMessage="No hay reservas en este periodo."
            />
          </section>
        </>
      ) : null}
    </div>
  )
}
