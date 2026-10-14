import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classesApi, roomsApi, toApiError, usersApi } from '@/api'
import { Badge } from '@/components/ui/atoms/Badge'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'

const PAGE_SIZE = 10
const SELECT_CLASS =
  'w-full rounded-full border border-white/10 bg-surface-sunken px-4 py-3 text-body text-text outline-none focus-visible:border-primary'

type ClassForm = {
  id: number | null
  name: string
  capacity: string
  trainer_id: string
  room_id: string
  is_active: boolean
}

const EMPTY_FORM: ClassForm = {
  id: null,
  name: '',
  capacity: '10',
  trainer_id: '',
  room_id: '',
  is_active: true,
}

export function AdminClassesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [trainerId, setTrainerId] = useState('')
  const [form, setForm] = useState<ClassForm | null>(null)

  const trainers = useQuery({
    queryKey: ['users', 'trainers'],
    queryFn: () => usersApi.list({ role: 'trainer', size: 100 }),
  })
  const rooms = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list({ size: 100 }),
  })
  const classes = useQuery({
    queryKey: ['classes', 'admin', { page, trainerId }],
    queryFn: () =>
      classesApi.list({
        page,
        size: PAGE_SIZE,
        trainer_id: trainerId ? Number(trainerId) : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['classes'] })

  const save = useMutation({
    mutationFn: (data: ClassForm) => {
      const payload = {
        name: data.name.trim(),
        capacity: Number(data.capacity),
        trainer_id: Number(data.trainer_id),
        room_id: data.room_id ? Number(data.room_id) : null,
        is_active: data.is_active,
      }
      return data.id === null ? classesApi.create(payload) : classesApi.update(data.id, payload)
    },
    onSuccess: () => {
      setForm(null)
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => classesApi.remove(id),
    onSuccess: refresh,
  })

  function handleDelete(id: number, name: string) {
    if (window.confirm(`¿Borrar la clase "${name}"? Esta acción no se puede deshacer.`)) {
      remove.mutate(id)
    }
  }

  const trainerName = (id: number) =>
    (trainers.data?.items ?? []).find((user) => user.id === id)?.full_name ?? `Entrenador #${id}`
  const roomName = (id: number | null) =>
    id === null
      ? '—'
      : ((rooms.data?.items ?? []).find((room) => room.id === id)?.name ?? `Sala #${id}`)

  const items = classes.data?.items ?? []
  const canSave =
    form !== null &&
    form.name.trim().length > 0 &&
    Number(form.capacity) > 0 &&
    form.trainer_id !== ''

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Clases</h1>
        <Button onClick={() => setForm(EMPTY_FORM)}>Nueva clase</Button>
      </div>

      <label className="flex max-w-xs flex-col gap-1 text-small text-text-muted">
        Entrenador
        <select
          className={SELECT_CLASS}
          value={trainerId}
          onChange={(event) => {
            setPage(1)
            setTrainerId(event.target.value)
          }}
        >
          <option value="">Todos</option>
          {(trainers.data?.items ?? []).map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </label>

      {remove.isError ? <Alert variant="error">{toApiError(remove.error).message}</Alert> : null}
      {classes.isError ? <Alert variant="error">{toApiError(classes.error).message}</Alert> : null}

      {form ? (
        <form
          className="flex flex-col gap-3 rounded-card bg-surface p-4"
          aria-label={form.id === null ? 'Nueva clase' : 'Editar clase'}
          onSubmit={(event) => {
            event.preventDefault()
            if (canSave) save.mutate(form)
          }}
        >
          {save.isError ? <Alert variant="error">{toApiError(save.error).message}</Alert> : null}
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Nombre
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Capacidad
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Entrenador
            <select
              className={SELECT_CLASS}
              value={form.trainer_id}
              onChange={(event) => setForm({ ...form, trainer_id: event.target.value })}
              required
            >
              <option value="">Elige un entrenador</option>
              {(trainers.data?.items ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-small text-text-muted">
            Sala
            <select
              className={SELECT_CLASS}
              value={form.room_id}
              onChange={(event) => setForm({ ...form, room_id: event.target.value })}
            >
              <option value="">Sin sala</option>
              {(rooms.data?.items ?? []).map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-small text-text-muted">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
            Activa
          </label>
          <div className="flex gap-2">
            <Button type="submit" isLoading={save.isPending} disabled={!canSave}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {classes.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!classes.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay clases con estos filtros.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((gymClass) => (
            <li
              key={gymClass.id}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-4"
            >
              <div className="flex flex-col">
                <span className="font-display text-title text-text">{gymClass.name}</span>
                <span className="text-small text-text-muted">
                  {trainerName(gymClass.trainer_id)} · {roomName(gymClass.room_id)} ·{' '}
                  {gymClass.capacity} plazas
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!gymClass.is_active ? <Badge tone="neutral">Inactiva</Badge> : null}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      id: gymClass.id,
                      name: gymClass.name,
                      capacity: String(gymClass.capacity),
                      trainer_id: String(gymClass.trainer_id),
                      room_id: gymClass.room_id === null ? '' : String(gymClass.room_id),
                      is_active: gymClass.is_active,
                    })
                  }
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(gymClass.id, gymClass.name)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {classes.data && classes.data.pages > 1 ? (
        <Pagination page={page} pages={classes.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
