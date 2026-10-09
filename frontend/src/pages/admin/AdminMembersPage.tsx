import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button } from '@/components/ui'
import { MembersList } from '@/components/organisms/MembersList'
import { toApiError, usersApi } from '@/api'
import { downloadBlob } from '@/lib/download'
import type { User } from '@/types/api'
import { MemberDetail } from './members/MemberDetail'
import { MovementsReport } from './members/MovementsReport'
import { useAdminMembers } from './members/useAdminMembers'
import { UserForm } from './users/UserForm'
import { useToggleUserActive } from './users/useToggleUserActive'

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

/** Which panel is open below the list. */
type Panel = { kind: 'create' } | { kind: 'edit'; member: User } | { kind: 'detail'; member: User }

export function AdminMembersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [panel, setPanel] = useState<Panel | null>(null)

  const members = useAdminMembers({ page, search, isActive: IS_ACTIVE[status] })

  const toggleActive = useToggleUserActive()

  const exportCsv = useMutation({
    mutationFn: () => usersApi.exportMembersCsv(),
    onSuccess: (blob) => downloadBlob(blob, 'socios.csv'),
  })

  function handleSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function handleStatus(value: StatusFilter) {
    setPage(1)
    setStatus(value)
  }

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

      {toggleActive.error ? (
        <Alert variant="error">{toApiError(toggleActive.error).message}</Alert>
      ) : null}
      {exportCsv.isError ? (
        <Alert variant="error">{toApiError(exportCsv.error).message}</Alert>
      ) : null}

      <MembersList
        members={members.members}
        isLoading={members.isLoading}
        error={members.isError ? toApiError(members.error).message : null}
        emptyMessage="No hay socios con estos filtros."
        search={search}
        onSearch={handleSearch}
        page={page}
        pages={members.pages}
        onPageChange={setPage}
        renderActions={(member) => (
          <div className="table-actions">
            <Button
              variant="ghost"
              onClick={() => setPanel({ kind: 'detail', member: member.user })}
            >
              Ver
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPanel({ kind: 'edit', member: member.user })}
            >
              Editar
            </Button>
            <Button
              variant={member.user.is_active ? 'danger' : 'primary'}
              onClick={() => toggleActive.toggle(member.user)}
            >
              {member.user.is_active ? 'Dar de baja' : 'Reactivar'}
            </Button>
          </div>
        )}
      />

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
