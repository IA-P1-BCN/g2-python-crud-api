import type { ReactNode } from 'react'
import { Badge, type BadgeTone } from '@/components/ui'
import { formatDate, formatPrice } from '@/lib/format'
import type { MembershipStatus, PaymentStatus } from '@/types/api'

export type MemberPayment = {
  amountCents: number
  /** ISO date or datetime of the payment. */
  date: string
  status: PaymentStatus
}

export type MemberListItemProps = {
  name: string
  email: string
  /** Name of the member's current plan, if any. */
  planName: string | null
  /** State of the member's current membership, if any. */
  membershipStatus: MembershipStatus | null
  /** Most recent payment, if any. */
  lastPayment: MemberPayment | null
  /** Row actions (Ver, Editar, …). */
  children?: ReactNode
  className?: string
}

const MEMBERSHIP_LABEL: Record<MembershipStatus, string> = {
  active: 'Activa',
  expired: 'Caducada',
  cancelled: 'Cancelada',
}

const MEMBERSHIP_TONE: Record<MembershipStatus, BadgeTone> = {
  active: 'success',
  expired: 'warning',
  cancelled: 'danger',
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
}

const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function MemberListItem({
  name,
  email,
  planName,
  membershipStatus,
  lastPayment,
  children,
  className = '',
}: MemberListItemProps) {
  return (
    <article className={`member-item ${className}`.trim()}>
      <span className="avatar" aria-hidden="true">
        {initials(name)}
      </span>

      <div className="member-item__identity">
        <span className="member-item__name">{name}</span>
        <span className="member-item__email">{email}</span>
      </div>

      <div className="member-item__plan">
        <Badge tone="neutral">{planName ?? 'Sin plan'}</Badge>
        {membershipStatus ? (
          <Badge tone={MEMBERSHIP_TONE[membershipStatus]}>
            {MEMBERSHIP_LABEL[membershipStatus]}
          </Badge>
        ) : null}
      </div>

      <div className="member-item__payment">
        {lastPayment ? (
          <>
            <span className="member-item__amount">{formatPrice(lastPayment.amountCents)}</span>
            <span className="card__meta">{formatDate(lastPayment.date)}</span>
            <Badge tone={PAYMENT_TONE[lastPayment.status]}>
              {PAYMENT_LABEL[lastPayment.status]}
            </Badge>
          </>
        ) : (
          <span className="card__meta">Sin pagos</span>
        )}
      </div>

      {children ? <div className="member-item__actions">{children}</div> : null}
    </article>
  )
}
