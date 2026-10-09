import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import { Alert } from '@/components/ui/molecules/Alert'
import { MemberListItem, type MemberListItemProps } from '@/components/ui/molecules/MemberListItem'
import { Pagination } from '@/components/ui/molecules/Pagination'

export type MemberListEntry = MemberListItemProps & { id: number }

export type MembersListProps<T extends MemberListEntry> = {
  members: T[]
  isLoading?: boolean
  /** Error message shown instead of the list. */
  error?: string | null
  emptyMessage?: string
  /** Committed search text. */
  search?: string
  /** Called with the trimmed text when the search form is submitted. */
  onSearch?: (value: string) => void
  page?: number
  pages?: number
  onPageChange?: (page: number) => void
  /** Row actions (Ver, Editar, …). */
  renderActions?: (member: T) => ReactNode
  className?: string
}

export function MembersList<T extends MemberListEntry>({
  members,
  isLoading = false,
  error = null,
  emptyMessage = 'No hay socios.',
  search = '',
  onSearch,
  page = 1,
  pages = 1,
  onPageChange,
  renderActions,
  className = '',
}: MembersListProps<T>) {
  const [term, setTerm] = useState(search)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSearch?.(term.trim())
  }

  return (
    <section className={`members-list ${className}`.trim()}>
      <form className="form form--inline" role="search" onSubmit={handleSubmit}>
        <label className="field field--grow">
          Buscar por nombre
          <input value={term} onChange={(event) => setTerm(event.target.value)} />
        </label>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!error && isLoading ? <p className="table-status">Cargando…</p> : null}

      {!error && !isLoading && members.length === 0 ? (
        <p className="table-status">{emptyMessage}</p>
      ) : null}

      {!error && !isLoading && members.length > 0 ? (
        <ul className="members-list__items">
          {members.map((member) => (
            <li key={member.id}>
              <MemberListItem
                name={member.name}
                email={member.email}
                planName={member.planName}
                membershipStatus={member.membershipStatus}
                lastPayment={member.lastPayment}
                className={member.className}
              >
                {renderActions ? renderActions(member) : null}
              </MemberListItem>
            </li>
          ))}
        </ul>
      ) : null}

      {!error && !isLoading && pages > 1 ? (
        <Pagination page={page} pages={pages} onChange={(next) => onPageChange?.(next)} />
      ) : null}
    </section>
  )
}
