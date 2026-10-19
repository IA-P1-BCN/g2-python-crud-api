import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { Table, type Column } from '@/components/ui/organisms/Table'
import { toApiError, usersApi } from '@/api'
import { currentPeriodRange, type CalendarPeriod } from '@/lib/dates'
import { formatDate } from '@/lib/format'
import type { User } from '@/types/api'

const PERIODS: { value: CalendarPeriod; label: string }[] = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
]

const REPORT_SIZE = 100

const signupColumns: Column<User>[] = [
  { key: 'full_name', header: 'Socio' },
  { key: 'email', header: 'Email' },
  { key: 'created_at', header: 'Alta', render: (row) => formatDate(row.created_at) },
]

const signOffColumns: Column<User>[] = [
  { key: 'full_name', header: 'Socio' },
  { key: 'email', header: 'Email' },
  {
    key: 'deactivated_at',
    header: 'Baja',
    render: (row) => (row.deactivated_at ? formatDate(row.deactivated_at) : ''),
  },
]

/** Signups and sign-offs of members in the current week, month or year. */
export function MovementsReport() {
  const [period, setPeriod] = useState<CalendarPeriod>('month')
  const range = currentPeriodRange(period)

  const signups = useQuery({
    queryKey: ['users', 'signups', range],
    queryFn: () =>
      usersApi.list({
        role: 'member',
        created_from: range.from,
        created_to: range.to,
        size: REPORT_SIZE,
      }),
  })
  const signOffs = useQuery({
    queryKey: ['users', 'sign-offs', range],
    queryFn: () =>
      usersApi.list({
        role: 'member',
        deactivated_from: range.from,
        deactivated_to: range.to,
        size: REPORT_SIZE,
      }),
  })

  const error = signups.error ?? signOffs.error

  return (
    <section className="card" aria-label="Altas y bajas">
      <div className="page__header">
        <h2 className="card__title">Altas y bajas</h2>
        <div className="form__actions" role="group" aria-label="Periodo del informe">
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
      <p className="card__meta">
        Del {formatDate(range.from)} al {formatDate(range.to)}
      </p>

      {error ? <Alert variant="error">{toApiError(error).message}</Alert> : null}

      <h3>Altas: {signups.data?.total ?? '…'}</h3>
      <Table
        columns={signupColumns}
        rows={signups.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={signups.isLoading}
        emptyMessage="No hay altas en este periodo."
      />

      <h3>Bajas: {signOffs.data?.total ?? '…'}</h3>
      <Table
        columns={signOffColumns}
        rows={signOffs.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={signOffs.isLoading}
        emptyMessage="No hay bajas en este periodo."
      />
    </section>
  )
}
