import { Avatar } from '@/components/ui/atoms/Avatar'
import { Badge, type BadgeTone } from '@/components/ui/atoms/Badge'
import { ChartCard } from '@/components/ui/molecules/ChartCard'
import { formatDate } from '@/lib/format'
import type { ExpiringMembership } from '@/types/api'

export type ExpiringMembershipsListProps = {
  memberships: ExpiringMembership[]
  className?: string
}

const URGENT_DAYS = 2

function daysLeftLabel(days: number): string {
  return days === 1 ? '1 día' : `${days} días`
}

function daysLeftTone(days: number): BadgeTone {
  return days <= URGENT_DAYS ? 'danger' : 'warning'
}

/** Members whose membership expires within the next 7 days. Read-only, no renewal button. */
export function ExpiringMembershipsList({ memberships, className }: ExpiringMembershipsListProps) {
  return (
    <ChartCard title="Membresías que vencen en 7 días" className={className}>
      {memberships.length === 0 ? (
        <p className="text-body text-text-muted">Ninguna membresía vence en los próximos 7 días.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {memberships.map((membership) => (
            <li key={membership.membership_id} className="flex items-center gap-3">
              <Avatar name={membership.full_name} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body text-text">{membership.full_name}</span>
                <span className="text-small text-text-muted">{membership.plan_name}</span>
              </div>
              <span className="text-small text-text-muted">{formatDate(membership.end_date)}</span>
              <Badge tone={daysLeftTone(membership.days_left)} dot>
                {daysLeftLabel(membership.days_left)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
