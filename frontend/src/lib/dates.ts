export type CalendarPeriod = 'week' | 'month' | 'year'

export type DateRange = { from: string; to: string }

/** Local date as YYYY-MM-DD, the format the API expects for dates. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** From the first day of the current week (Monday), month or year up to today. */
export function currentPeriodRange(period: CalendarPeriod, today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (period === 'week') {
    const daysSinceMonday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - daysSinceMonday)
  } else if (period === 'month') {
    start.setDate(1)
  } else {
    start.setMonth(0, 1)
  }
  return { from: toIsoDate(start), to: toIsoDate(today) }
}
