import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

export type TableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  isLoading?: boolean
  emptyMessage?: string
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyMessage = 'No hay datos que mostrar',
}: TableProps<T>) {
  if (isLoading) {
    return <p className="table-status">Cargando…</p>
  }

  if (rows.length === 0) {
    return <p className="table-status">{emptyMessage}</p>
  }

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
