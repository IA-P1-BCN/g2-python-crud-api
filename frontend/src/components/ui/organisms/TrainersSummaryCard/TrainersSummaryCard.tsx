import { Badge } from '@/components/ui/atoms/Badge'
import { Alert } from '@/components/ui/molecules/Alert'
import { ChartCard } from '@/components/ui/molecules/ChartCard'

export type TrainerSummaryRow = {
  id: number
  name: string
  /** Weekly scheduled sessions. */
  sessions: number
}

export type TrainersSummaryCardProps = {
  trainers: TrainerSummaryRow[]
  isLoading?: boolean
  error?: string | null
  className?: string
}

/** Active trainers and how many weekly sessions each one has. */
export function TrainersSummaryCard({
  trainers,
  isLoading = false,
  error = null,
  className,
}: TrainersSummaryCardProps) {
  return (
    <ChartCard
      title="Entrenadores"
      subtitle="Activos y sus sesiones semanales"
      badge={{ label: `${trainers.length} activos` }}
      className={className}
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      {!error && isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}

      {!error && !isLoading && trainers.length === 0 ? (
        <p className="text-body text-text-muted">No hay entrenadores activos.</p>
      ) : null}

      {!error && !isLoading && trainers.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {trainers.map((trainer) => (
            <li key={trainer.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-body text-text">{trainer.name}</span>
              <Badge tone="info">
                {trainer.sessions} {trainer.sessions === 1 ? 'sesión' : 'sesiones'}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </ChartCard>
  )
}
