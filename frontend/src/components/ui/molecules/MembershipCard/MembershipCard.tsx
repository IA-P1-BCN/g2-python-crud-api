import { Badge, type BadgeTone } from '@/components/ui/atoms/Badge'
import { ProgressBar } from '@/components/ui/atoms/ProgressBar'
import { cn } from '@/lib/cn'
import type { MembershipStatus } from '@/types/api'

export type MembershipCardProps = {
  planName: string
  status: MembershipStatus
  /** Already formatted end date. */
  endDate: string
  daysLeft: number
  /** Length of the membership in days, for the progress bar. */
  totalDays: number
  className?: string
}

const STATUS_LABEL: Record<MembershipStatus, string> = {
  active: 'Activa',
  expired: 'Caducada',
  cancelled: 'Cancelada',
}

const STATUS_TONE: Record<MembershipStatus, BadgeTone> = {
  active: 'success',
  expired: 'warning',
  cancelled: 'danger',
}

export function MembershipCard({
  planName,
  status,
  endDate,
  daysLeft,
  totalDays,
  className,
}: MembershipCardProps) {
  const safeTotal = totalDays > 0 ? totalDays : 1
  const remaining = Math.max(daysLeft, 0)

  return (
    <section
      className={cn('flex flex-col gap-3 rounded-card bg-secondary p-6 text-white', className)}
      aria-label="Mi membresía"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-headline">{planName}</h2>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </div>

      <p className="text-body text-white/90">Termina el {endDate}</p>

      <ProgressBar
        value={remaining}
        max={safeTotal}
        variant="secondary-soft"
        label="Días restantes"
      />
      <p className="text-small text-white/90">{remaining} días restantes</p>
    </section>
  )
}
