import { useState, type FormEvent } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Alert, Button, Pagination, Table, type Column } from '@/components/ui'
import { toApiError, usersApi } from '@/api'
import type { Role, User } from '@/types/api'
import { ROLE_LABELS } from './users/roleLabels'
import { UserForm } from './users/UserForm'
import { UserStatusBadge } from './users/UserStatusBadge'
import { useToggleUserActive } from './users/useToggleUserActive'

const PAGE_SIZE = 10

/** Staff first: this screen is mainly for trainers and admins. */
const ASSIGNABLE_ROLES: Role[] = ['trainer', 'admin', 'member']

const ROLE_FILTERS: { value: Role | undefined; label: string }[] = [
  { value: undefined, label: 'Todos' },
  { value: 'trainer', label: 'Entrenadores' },
  { value: 'admin', label: 'Administradores' },
  { value: 'member', label: 'Socios' },
]

/** Which form is open below the table. */
type Panel = { kind: 'create' } | { kind: 'edit'; user: User }

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | undefined>(undefined)
  const [panel, setPanel] = useState<Panel | null>(null)
  const toggleActive = useToggleUserActive()

  const users = useQuery({
    queryKey: ['users', 'all', { page, search, role }],
    queryFn: () => usersApi.list({ page, size: PAGE_SIZE, role, search: search || undefined }),
    placeholderData: keepPreviousData,
  })

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleRole(value: Role | undefined) {
    setPage(1)
    setRole(value)
  }

  const columns: Column<User>[] = [
    { key: 'full_name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rol', render: (row) => ROLE_LABELS[row.role] },
    { key: 'is_active', header: 'Estado', render: (row) => <UserStatusBadge user={row} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => setPanel({ kind: 'edit', user: row })}>
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
        <h1>Usuarios y roles</h1>
        <Button onClick={() => setPanel({ kind: 'create' })}>Nuevo usuario</Button>
      </div>
      <p className="card__meta">
        Da de alta entrenadores y administradores, o cambia el rol de cualquier usuario. Nadie puede
        darse de baja a sí mismo.
      </p>

      <form className="form form--inline" onSubmit={handleSearch} role="search">
        <label className="field field--grow">
          Buscar por nombre o email
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        </label>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="form__actions" role="group" aria-label="Rol">
        {ROLE_FILTERS.map((option) => (
          <Button
            key={option.label}
            variant={option.value === role ? 'primary' : 'secondary'}
            aria-pressed={option.value === role}
            onClick={() => handleRole(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {users.isError ? <Alert variant="error">{toApiError(users.error).message}</Alert> : null}
      {toggleActive.error ? (
        <Alert variant="error">{toApiError(toggleActive.error).message}</Alert>
      ) : null}

      <Table
        columns={columns}
        rows={users.data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={users.isLoading}
        emptyMessage="No hay usuarios con estos filtros."
      />

      {users.data && users.data.pages > 1 ? (
        <Pagination page={page} pages={users.data.pages} onChange={setPage} />
      ) : null}

      {panel?.kind === 'create' ? (
        <UserForm roles={ASSIGNABLE_ROLES} noun="usuario" onDone={() => setPanel(null)} />
      ) : null}
      {panel?.kind === 'edit' ? (
        <UserForm
          key={panel.user.id}
          user={panel.user}
          roles={ASSIGNABLE_ROLES}
          noun="usuario"
          onDone={() => setPanel(null)}
        />
      ) : null}
    </div>
  )
}
