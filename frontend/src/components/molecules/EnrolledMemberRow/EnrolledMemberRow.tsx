export type EnrolledMemberRowProps = {
  /** Member full name. */
  name: string
  /** Member number (their id). */
  memberNumber: number
  /** Already formatted booking time, e.g. "09:15". */
  time: string
  className?: string
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function EnrolledMemberRow({
  name,
  memberNumber,
  time,
  className = '',
}: EnrolledMemberRowProps) {
  return (
    <div className={`enrolled-member-row ${className}`.trim()}>
      <span className="avatar" aria-hidden="true">
        {initials(name)}
      </span>
      <div className="enrolled-member-row__info">
        <span className="enrolled-member-row__name">{name}</span>
        <span className="enrolled-member-row__number">Socio #{memberNumber}</span>
      </div>
      <time className="enrolled-member-row__time">{time}</time>
    </div>
  )
}
