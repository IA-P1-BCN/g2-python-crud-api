export type DayChipProps = {
  /** Day abbreviation shown on top (e.g. "Lun"). */
  day: string
  /** Day of the month shown below (e.g. 6). */
  date: number
  /** Whether this day is the selected one; renders it in lime. */
  isSelected?: boolean
  /** Whether the day has sessions; renders a marker. */
  hasSessions?: boolean
  onClick?: () => void
  className?: string
}

export function DayChip({
  day,
  date,
  isSelected = false,
  hasSessions = false,
  onClick,
  className = '',
}: DayChipProps) {
  const classes = ['day-chip', isSelected ? 'day-chip--selected' : '', className]
    .filter(Boolean)
    .join(' ')
  const label = `${day} ${date}${hasSessions ? ', con sesiones' : ''}`

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={isSelected}
      aria-label={label}
      onClick={onClick}
    >
      <span className="day-chip__day" aria-hidden="true">
        {day}
      </span>
      <span className="day-chip__date" aria-hidden="true">
        {date}
      </span>
      {hasSessions ? <span className="day-chip__marker" aria-hidden="true" /> : null}
    </button>
  )
}
