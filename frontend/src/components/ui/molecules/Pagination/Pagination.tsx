import { Button } from '@/ui/atoms/Button'

export type PaginationProps = {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  const total = Math.max(pages, 1)

  return (
    <nav className="pagination" aria-label="Paginación">
      <Button
        variant="secondary"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        Anterior
      </Button>
      <span className="pagination__status" aria-live="polite">
        Página {page} de {total}
      </span>
      <Button
        variant="secondary"
        onClick={() => onChange(page + 1)}
        disabled={page >= total}
        aria-label="Página siguiente"
      >
        Siguiente
      </Button>
    </nav>
  )
}
