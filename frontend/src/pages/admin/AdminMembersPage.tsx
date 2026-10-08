import { useState, type FormEvent } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { Alert, Button, Pagination, Table, type Column } from '@/components/ui'
import { toApiError, usersApi } from '@/api'
import { downloadBlob } from '@/lib/download'
import { formatDate } from '@/lib/format'
import type { User } from '@/types/api'
import { MemberDetail } from './members/MemberDetail'
import { MovementsReport } from './members/MovementsReport'
import { UserForm } from './users/UserForm'
import { UserStatusBadge } from './users/UserStatusBadge'
import { useToggleUserActive } from './users/useToggleUserActive'

const PAGE_SIZE = 10

type StatusFilter = 'all' | 'active' | 'inactive'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'De baja' },
]

const IS_ACTIVE: Record<StatusFilter, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
}

/** Which panel is open below the table. */
type Panel = { kind: 'create' } | { kind: 'edit'; member: User } | { kind: 'detail'; member: User }

export function AdminMembersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [panel, setPanel] = useState<Panel | null>(null)

  const members = useQuery({
    queryKey: ['users', 'members', { page, search, status }],
    queryFn: () =>
      usersApi.list({
        role: 'member',
        page,
        size: PAGE_SIZE,
        search: search || undefined,
        is_active: IS_ACTIVE[status],
      }),
    placeholderData: keepPreviousData,
  })

  const toggleActive = useToggleUserActive()

  const exportCsv = useMutation({
    mutationFn: () => usersApi.exportMembersCsv(),
    onSuccess: (blob) => downloadBlob(blob, 'socios.csv'),
  })

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleStatus(value: StatusFilter) {
    setPage(1)
    setStatus(value)
  }

  const columns: Column<User>[] = [
    { key: 'full_name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'created_at', header: 'Alta', render: (row) => formatDate(row.created_at) },
    {
      key: 'is_active',
      header: 'Estado',
      render: (row) => <UserStatusBadge user={row} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="table-actions">
          <Button variant="ghost" onClick={() => setPanel({ kind: 'detail', member: row })}>
            Ver
          </Button>
          <Button variant="secondary" onClick={() => setPanel({ kind: 'edit', member: row })}>
            Editar
          </Button>
          <Button
            variant={row.is_active ? 'danger' : 'primary'}
            onClick={() => toggleActive.toggle(row)}
          >
            {row.is_active ? 'Dar de baja' : 'Reactivar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page__header">
        <h1>Socios</h1>
        <div className="form__actions">
          <Button onClick={() => setPanel({ kind: 'create' })}>Nuevo socio</Button>
          <Button
            variant="secondary"
            isLoading={exportCsv.isPending}
            onClick={() => exportCsv.mutate()}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      <form className="form form--inline" onSubmit={handleSearch} role="search">
        <label className="field field--grow">
          Buscar por nombre o email
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        </label>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="form__actions" role="group" aria-label="Estado">
        {STATUS_FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={option.value === status ? 'primary' : 'secondary'}
            aria-pressed={option.value === status}
            onClick={() => handleStatus(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {members.isError ? <Alert variant="error">{toApiError(members.error).message}</Alert> : null}
      {toggleActive.error ? (
        <Alert variant="error">{toApiError(toggleActive.error).message}</Alert>
      ) : null}
      {exportCsv.isError ? (
        <Alert variant="error">{toApiError(exportCsv.error).message}</Alert>
      ) : null}

      <Table
        columns={columns}
        rows={members.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={members.isLoading}
        emptyMessage="No hay socios con estos filtros."
      />

      {members.data && members.data.pages > 1 ? (
        <Pagination page={page} pages={members.data.pages} onChange={setPage} />
      ) : null}

      {panel?.kind === 'create' ? (
        <UserForm roles={['member']} noun="socio" onDone={() => setPanel(null)} />
      ) : null}
      {panel?.kind === 'edit' ? (
        <UserForm
          key={panel.member.id}
          user={panel.member}
          roles={['member']}
          noun="socio"
          onDone={() => setPanel(null)}
        />
      ) : null}
      {panel?.kind === 'detail' ? (
        <MemberDetail member={panel.member} onClose={() => setPanel(null)} />
      ) : null}

      <MovementsReport />
    </div>
  )
}
