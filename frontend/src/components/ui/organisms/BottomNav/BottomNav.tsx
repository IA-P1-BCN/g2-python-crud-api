import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type BottomNavItem = {
  to: string
  label: string
  icon: IconName
}

export type BottomNavProps = {
  items: BottomNavItem[]
  className?: string
}

export function BottomNav({ items, className }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación inferior"
      className={cn(
        'fixed inset-x-0 bottom-0 flex h-20 items-center justify-around gap-1 border-t border-line bg-surface px-2',
        className,
      )}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-tile px-4 py-2 text-caption',
              isActive ? 'bg-primary text-ink' : 'text-text-muted',
            )
          }
        >
          <Icon name={item.icon} size={24} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
