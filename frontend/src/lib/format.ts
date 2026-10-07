const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Maps the numeric `day_of_week` (0 = Monday) to its Spanish label. */
export function dayLabel(day: number): string {
  return DAYS[day] ?? `Día ${day}`
}

/** Trims "HH:MM:SS" to "HH:MM". */
export function formatTime(value: string): string {
  return value.slice(0, 5)
}

/** Formats an amount in cents as a euro currency string (e.g. 3999 → "39,99 €"). */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
