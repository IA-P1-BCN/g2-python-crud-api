import { Badge } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { User } from '@/types/api'

/** "Activo", or "Baja" with the sign-off date. */
export function UserStatusBadge({ user }: { user: User }) {
  if (user.is_active) return <Badge tone="success">Activo</Badge>
  return (
    <Badge tone="danger">
      Baja{user.deactivated_at ? ` · ${formatDate(user.deactivated_at)}` : ''}
    </Badge>
  )
}
