import { useMemo, useState } from 'react'
import { CapacitySummary } from '@/components/ui/molecules/CapacitySummary'
import { EnrolledMemberRow } from '@/components/ui/molecules/EnrolledMemberRow'
import { Alert } from '@/components/ui/molecules/Alert'

export type EnrolledMember = {
  id: number
  name: string
  memberNumber: number
  /** Already formatted booking time, e.g. "09:15". */
  time: string
}

export type EnrolledMembersPanelProps = {
  /** Class name shown in the header. */
  title: string
  /** Already formatted session date. */
  date: string
  enrolled: number
  capacity: number
  members: EnrolledMember[]
  isLoading?: boolean
  error?: string | null
  onClose?: () => void
  className?: string
}

export function EnrolledMembersPanel({
  title,
  date,
  enrolled,
  capacity,
  members,
  isLoading = false,
  error = null,
  onClose,
  className = '',
}: EnrolledMembersPanelProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return members
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(term) || String(member.memberNumber).includes(term),
    )
  }, [members, query])

  return (
    <aside className={`enrolled-panel ${className}`.trim()} aria-label={`Inscritos en ${title}`}>
      <header className="enrolled-panel__header">
        <div>
          <h2 className="enrolled-panel__title">{title}</h2>
          <span className="card__meta">{date}</span>
        </div>
        {onClose ? (
          <button
            type="button"
            className="enrolled-panel__close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        ) : null}
      </header>

      <CapacitySummary enrolled={enrolled} capacity={capacity} />

      <label className="field">
        <span>Buscar miembro</span>
        <input
          type="search"
          value={query}
          placeholder="Nombre o número de socio"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!error && isLoading ? <p className="enrolled-panel__status">Cargando inscritos…</p> : null}

      {!error && !isLoading && filtered.length === 0 ? (
        <p className="enrolled-panel__status">
          {members.length === 0 ? 'No hay miembros inscritos.' : 'Sin resultados.'}
        </p>
      ) : null}

      {!error && !isLoading && filtered.length > 0 ? (
        <ul className="enrolled-panel__list">
          {filtered.map((member) => (
            <li key={member.id}>
              <EnrolledMemberRow
                name={member.name}
                memberNumber={member.memberNumber}
                time={member.time}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}
