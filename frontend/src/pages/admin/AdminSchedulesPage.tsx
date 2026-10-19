import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classesApi, roomsApi, schedulesApi, toApiError } from '@/api'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { dayLabel } from '@/lib/format'

const PAGE_SIZE = 10
const DAYS = [0, 1, 2, 3, 4, 5, 6]
const SELECT_CLASS =
  'w-full rounded-full border border-white/10 bg-surface-sunken px-4 py-3 text-body text-text outline-none focus-visible:border-primary'

type ScheduleForm = {
  id: number | null
  class_id: string
  day_of_week: string
  start_time: string
  end_time: string
  room_id: string
}

const EMPTY_FORM: ScheduleForm = {
  id: null,
  class_id: '',
  day_of_week: '0',
  start_time: '10:00',
  end_time: '11:00',
  room_id: '',
}

export function AdminSchedulesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [classId, setClassId] = useState('')
  const [day, setDay] = useState('')
  const [form, setForm] = useState<ScheduleForm | null>(null)

  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ size: 100 }),
  })
  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: 100 }),
  })
  const schedules = useQuery({
    queryKey: ['class-schedules', 'admin', { page, classId, day }],
    queryFn: () =>
      schedulesApi.list({
        page,
        size: PAGE_SIZE,
        class_id: classId ? Number(classId) : undefined,
        day_of_week: day === '' ? undefined : Number(day),
      }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['class-schedules'] })

  const save = useMutation({
    mutationFn: (data: ScheduleForm) => {
      const payload = {
        class_id: Number(data.class_id),
        day_of_week: Number(data.day_of_week),
        start_time: data.start_time,
        end_time: data.end_time,
        room_id: Number(data.room_id),
      }
      return data.id === null ? schedulesApi.create(payload) : schedulesApi.update(data.id, payload)
    },
    onSuccess: () => {
      setForm(null)
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => schedulesApi.remove(id),
    onSuccess: refresh,
  })

  function handleDelete(id: number) {
    if (window.confirm('¿Borrar este horario? Esta acción no se puede deshacer.')) {
      remove.mutate(id)
    }
  }

  const className = (id: number) =>
    (classes.data?.items ?? []).find((item) => item.id === id)?.name ?? `Clase #${id}`
  const roomName = (id: number | null) =>
    id === null
      ? '—'
      : ((rooms.data?.items ?? []).find((room) => room.id === id)?.name ?? `Sala #${id}`)

  const items = schedules.data?.items ?? []
  const hasRoom = (rooms.data?.items ?? []).length > 0
  const canSave =
    form !== null && form.class_id !== '' && form.room_id !== '' && form.start_time < form.end_time

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Horarios</h1>
        <Button
          onClick={() =>
            setForm({
              ...EMPTY_FORM,
              class_id: classes.data?.items[0] ? String(classes.data.items[0].id) : '',
              room_id: rooms.data?.items[0] ? String(rooms.data.items[0].id) : '',
            })
          }
        >
          Nuevo horario
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Clase
          <select
            className={SELECT_CLASS}
            value={classId}
            onChange={(event) => {
              setPage(1)
              setClassId(event.target.value)
            }}
          >
            <option value="">Todas</option>
            {(classes.data?.items ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small text-text-muted">
          Día
          <select
            className={SELECT_CLASS}
            value={day}
            onChange={(event) => {
              setPage(1)
              setDay(event.target.value)
            }}
          >
            <option value="">Todos</option>
            {DAYS.map((value) => (
              <option key={value} value={value}>
                {dayLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {remove.isError ? <Alert variant="error">{toApiError(remove.error).message}</Alert> : null}
      {schedules.isError ? (
        <Alert variant="error">{toApiError(schedules.error).message}</Alert>
      ) : null}

      {form ? (
        <form
          className="flex flex-col gap-3 rounded-card bg-surface p-4"
          aria-label={form.id === null ? 'Nuevo horario' : 'Editar horario'}
          onSubmit={(event) => {
            event.preventDefault()
            if (canSave) save.mutate(form)
          }}
        >
          {save.isError ? <Alert variant="error">{toApiError(save.error).message}</Alert> : null}
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Clase
            <select
              className={SELECT_CLASS}
              value={form.class_id}
              onChange={(event) => setForm({ ...form, class_id: event.target.value })}
              required
            >
              <option value="">Elige una clase</option>
              {(classes.data?.items ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Día
            <select
              className={SELECT_CLASS}
              value={form.day_of_week}
              onChange={(event) => setForm({ ...form, day_of_week: event.target.value })}
            >
              {DAYS.map((value) => (
                <option key={value} value={value}>
                  {dayLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-small text-text-muted">
              Inicio
              <Input
                type="time"
                value={form.start_time}
                onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-small text-text-muted">
              Fin
              <Input
                type="time"
                value={form.end_time}
                onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Sala
            <select
              className={SELECT_CLASS}
              value={form.room_id}
              onChange={(event) => setForm({ ...form, room_id: event.target.value })}
              required
              disabled={!hasRoom}
            >
              <option value="">Elige una sala</option>
              {(rooms.data?.items ?? []).map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={save.isPending} disabled={!canSave}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {schedules.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!schedules.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay horarios con estos filtros.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((schedule) => (
            <li
              key={schedule.id}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-4"
            >
              <div className="flex flex-col">
                <span className="font-display text-title text-text">
                  {className(schedule.class_id)}
                </span>
                <span className="text-small text-text-muted">
                  {dayLabel(schedule.day_of_week)} · {schedule.start_time.slice(0, 5)}–
                  {schedule.end_time.slice(0, 5)} · {roomName(schedule.room_id)}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      id: schedule.id,
                      class_id: String(schedule.class_id),
                      day_of_week: String(schedule.day_of_week),
                      start_time: schedule.start_time.slice(0, 5),
                      end_time: schedule.end_time.slice(0, 5),
                      room_id: schedule.room_id === null ? '' : String(schedule.room_id),
                    })
                  }
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(schedule.id)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {schedules.data && schedules.data.pages > 1 ? (
        <Pagination page={page} pages={schedules.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
