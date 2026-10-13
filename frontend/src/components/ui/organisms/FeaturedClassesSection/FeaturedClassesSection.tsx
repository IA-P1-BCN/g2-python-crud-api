import { Alert } from '@/components/ui/molecules/Alert'
import { FeaturedClassCard } from '@/components/ui/molecules/FeaturedClassCard'
import { cn } from '@/lib/cn'

export type FeaturedClassSummary = {
  id: number
  name: string
  schedule: string
  capacity: number
  trainerName?: string | null
}

export type FeaturedClassesSectionProps = {
  classes: FeaturedClassSummary[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  title?: string
  className?: string
}

export function FeaturedClassesSection({
  classes,
  isLoading = false,
  error = null,
  emptyMessage = 'Pronto publicaremos las clases.',
  title = 'Clases destacadas',
  className,
}: FeaturedClassesSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Clases destacadas">
      <h2 className="font-display text-headline text-text">{title}</h2>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {!error && isLoading ? <p className="text-body text-text-muted">Cargando…</p> : null}
      {!error && !isLoading && classes.length === 0 ? (
        <p className="text-body text-text-muted">{emptyMessage}</p>
      ) : null}

      {!error && !isLoading && classes.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {classes.map((gymClass) => (
            <FeaturedClassCard
              key={gymClass.id}
              name={gymClass.name}
              schedule={gymClass.schedule}
              capacity={gymClass.capacity}
              trainerName={gymClass.trainerName}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
