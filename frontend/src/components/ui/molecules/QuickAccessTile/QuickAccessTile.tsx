import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type QuickAccessTileProps = {
  icon: IconName
  label: string
  to: string
  className?: string
}

export function QuickAccessTile({ icon, label, to, className }: QuickAccessTileProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center gap-2 rounded-tile bg-surface p-4 text-center text-text',
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} size={20} />
      </span>
      <span className="font-display text-body">{label}</span>
    </Link>
  )
}
