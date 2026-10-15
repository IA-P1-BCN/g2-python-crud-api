import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { toApiError, usersApi } from '@/api'
import { Avatar } from '@/components/ui/atoms/Avatar'
import { Alert } from '@/components/ui/molecules/Alert'
import { Pagination } from '@/components/ui/molecules/Pagination'
import { SearchInput } from '@/components/ui/molecules/SearchInput'

const PAGE_SIZE = 10

/**
 * Read-only list of the gym members, with server-side search and pagination.
 *
 * The backend already limits a trainer to members only
 * (`access_service.visible_user_role`), so the role filter is not repeated here.
 */
export function TrainerMembersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const members = useQuery({
    queryKey: ['trainer', 'members', { page, search }],
    queryFn: () =>
      usersApi.list({ role: 'member', page, size: PAGE_SIZE, search: search || undefined }),
    placeholderData: keepPreviousData,
  })

  function handleSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  const items = members.data?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="page__header">
        <h1 className="font-display text-headline text-text">Mis socios</h1>
      </div>

      <SearchInput onSearch={handleSearch} placeholder="Buscar por nombre o correo" />

      {members.isError ? <Alert variant="error">{toApiError(members.error).message}</Alert> : null}

      {members.isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}

      {!members.isLoading && !members.isError && items.length === 0 ? (
        <p className="text-body text-text-muted">No hay socios con esta búsqueda.</p>
      ) : null}

      {!members.isError && items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-card bg-surface p-4">
              <Avatar name={member.full_name} />
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-title text-text">{member.full_name}</span>
                <span className="truncate text-small text-text-muted">{member.email}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {members.data && members.data.pages > 1 ? (
        <Pagination page={page} pages={members.data.pages} onChange={setPage} />
      ) : null}
    </div>
  )
}
