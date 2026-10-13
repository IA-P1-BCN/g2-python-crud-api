import { DayChip } from '@/components/ui/molecules/DayChip'
import { addDays, parseIsoDate, startOfWeek } from '@/lib/dates'
import { formatDate, shortDayLabel } from '@/lib/format'

export type WeekSelectorProps = {
  /** ISO date (YYYY-MM-DD) that defines the visible week and the selected day. */
  selectedDate: string
  /** Called with the ISO date of the clicked day, or ±7 days with the arrows. */
  onSelectDate: (isoDate: string) => void
  /** ISO dates that have sessions, shown as a marker on the DayChip. */
  sessionDates?: string[]
  className?: string
}

const DAYS_IN_WEEK = 7

export function WeekSelector({
  selectedDate,
  onSelectDate,
  sessionDates = [],
  className = '',
}: WeekSelectorProps) {
  const monday = startOfWeek(selectedDate)
  const days = Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(monday, index))
  const sunday = days[days.length - 1]

  return (
    <div
      className={`week-selector ${className}`.trim()}
      role="group"
      aria-label="Selector de semana"
    >
      <button
        type="button"
        className="week-selector__nav"
        aria-label="Semana anterior"
        onClick={() => onSelectDate(addDays(selectedDate, -DAYS_IN_WEEK))}
      >
        ←
      </button>

      <div className="week-selector__body">
        <span className="week-selector__range">
          {formatDate(monday)} – {formatDate(sunday)}
        </span>
        <div className="week-selector__days">
          {days.map((day, index) => (
            <DayChip
              key={day}
              day={shortDayLabel(index)}
              date={parseIsoDate(day).getDate()}
              isSelected={day === selectedDate}
              hasSessions={sessionDates.includes(day)}
              onClick={() => onSelectDate(day)}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="week-selector__nav"
        aria-label="Semana siguiente"
        onClick={() => onSelectDate(addDays(selectedDate, DAYS_IN_WEEK))}
      >
        →
      </button>
    </div>
  )
}
