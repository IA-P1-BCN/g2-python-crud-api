import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomsApi, toApiError } from '@/api'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'

const PAGE_SIZE = 10

type RoomForm = { id: number | null; name: string; capacity: string }

const EMPTY_FORM: RoomForm = { id: null, name: '', capacity: '10' }

export function AdminRoomsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<RoomForm | null>(null)

  const rooms = useQuery({
    queryKey: ['rooms', 'admin', page],
    queryFn: () => roomsApi.list({ page, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['rooms'] })

  const save = useMutation({
    mutationFn: (data: RoomForm) => {
      const payload = { name: data.name.trim(), capacity: Number(data.capacity) }
      return data.id === null ? roomsApi.create(payload) : roomsApi.update(data.id, payload)
    },
    onSuccess: () => {
      setForm(null)
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => roomsApi.remove(id),
    onSuccess: refresh,
  })

  function handleDelete(id: number, name: string) {
    if (window.confirm(`¿Borrar la sala "${name}"? Esta acción no se puede deshacer.`)) {
      remove.mutate(id)
    }
  }

  const items = rooms.data?.items ?? []
  const canSave = form !== null && form.name.trim().length > 0 && Number(form.capacity) > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Salas</h1>
        <Button onClick={() => setForm(EMPTY_FORM)}>Nueva sala</Button>
      </div>

      {remove.isError ? <Alert variant="error">{toApiError(remove.error).message}</Alert> : null}
      {rooms.isError ? <Alert variant="error">{toApiError(rooms.error).message}</Alert> : null}

      {form ? (
        <form
          className="flex flex-col gap-3 rounded-card bg-surface p-4"
          aria-label={form.id === null ? 'Nueva sala' : 'Editar sala'}
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

      {rooms.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!rooms.isLoading && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay salas.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between gap-2 rounded-card bg-surface p-4"
            >
              <div className="flex flex-col">
                <span className="font-display text-title text-text">{room.name}</span>
                <span className="text-small text-text-muted">{room.capacity} plazas</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({ id: room.id, name: room.name, capacity: String(room.capacity) })
                  }
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(room.id, room.name)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {rooms.data && rooms.data.pages > 1 ? (
        <Pagination page={page} pages={rooms.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
