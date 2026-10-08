import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, Button, Table, type Column } from '@/components/ui'
import { bookingsApi, toApiError, usersApi } from '@/api'
import { dayLabel, formatTime } from '@/lib/format'
import type { Booking } from '@/types/api'
import { useTrainerSessions, type TrainerSession } from './useTrainerSessions'

const PAGE_SIZE = 100

export function TrainerSessionsPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const { sessions, isLoading, isError, error } = useTrainerSessions()

  const selectedSession =
    sessions.find((session) => session.schedule.id === selectedScheduleId) ?? sessions[0] ?? null
  const activeScheduleId = selectedSession?.schedule.id ?? null

  const members = useQuery({
    queryKey: ['trainer', 'session-members', activeScheduleId, date],
    enabled: activeScheduleId !== null,
    queryFn: () =>
      bookingsApi.list({
        schedule_id: activeScheduleId ?? undefined,
        on_date: date,
        size: PAGE_SIZE,
      }),
  })

  const users = useQuery({
    queryKey: ['users', 'members'],
    queryFn: () => usersApi.list({ role: 'member', size: PAGE_SIZE }),
  })

  const userMap = useMemo(
    () => new Map((users.data?.items ?? []).map((member) => [member.id, member])),
    [users.data],
  )

  const activeMembers = members.data?.items ?? []
  const enrolledCount = activeMembers.filter((booking) => booking.status === 'confirmed').length

  const sessionColumns: Column<TrainerSession>[] = [
    { key: 'class', header: 'Clase', render: (session) => session.gymClass.name },
    { key: 'day', header: 'Día', render: (session) => dayLabel(session.schedule.day_of_week) },
    {
      key: 'time',
      header: 'Horario',
      render: (session) =>
        `${formatTime(session.schedule.start_time)} – ${formatTime(session.schedule.end_time)}`,
    },
    {
      key: 'actions',
      header: 'Sesión',
      render: (session) => (
        <Button
          variant={session.schedule.id === activeScheduleId ? 'secondary' : 'primary'}
          disabled={session.schedule.id === activeScheduleId}
          onClick={() => setSelectedScheduleId(session.schedule.id)}
        >
          {session.schedule.id === activeScheduleId ? 'Seleccionada' : 'Ver inscritos'}
        </Button>
      ),
    },
  ]

  const memberColumns: Column<Booking>[] = [
    {
      key: 'member_id',
      header: 'Miembro',
      render: (booking) =>
        userMap.get(booking.member_id)?.full_name ?? `Miembro #${booking.member_id}`,
    },
    {
      key: 'email',
      header: 'Email',
      render: (booking) => userMap.get(booking.member_id)?.email ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (booking) =>
        booking.status === 'confirmed' ? (
          <Badge tone="success">Confirmada</Badge>
        ) : (
          <Badge tone="neutral">Cancelada</Badge>
        ),
    },
  ]

  return (
    <div className="page">
      <div className="page__header">
        <h1>Mis sesiones</h1>
      </div>

      {isError ? <Alert variant="error">{toApiError(error).message}</Alert> : null}

      <h2>Mis clases y horarios</h2>
      <Table
        columns={sessionColumns}
        rows={sessions}
        rowKey={(session) => session.schedule.id}
        isLoading={isLoading}
        emptyMessage="No tienes clases ni horarios asignados."
      />

      <section className="members">
        <div className="page__header">
          <h2>Miembros inscritos</h2>
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>

        {selectedSession ? (
          <p className="table-status">
            {selectedSession.gymClass.name} · {dayLabel(selectedSession.schedule.day_of_week)} ·{' '}
            {formatTime(selectedSession.schedule.start_time)}–
            {formatTime(selectedSession.schedule.end_time)} · {enrolledCount} inscritos
          </p>
        ) : null}

        {members.isError ? (
          <Alert variant="error">{toApiError(members.error).message}</Alert>
        ) : null}

        <Table
          columns={memberColumns}
          rows={activeMembers}
          rowKey={(booking) => booking.id}
          isLoading={members.isLoading}
          emptyMessage="No hay miembros inscritos en esta sesión y fecha."
        />
      </section>
    </div>
  )
}
