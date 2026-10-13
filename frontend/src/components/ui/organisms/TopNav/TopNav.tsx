import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'

export type TopNavItem = {
  to: string
  label: string
  icon: IconName
}

export type TopNavProps = {
  items: TopNavItem[]
  className?: string
}

export function TopNav({ items, className }: TopNavProps) {
  return (
    <nav aria-label="Navegación principal" className={cn('flex items-center gap-1', className)}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-body',
              isActive ? 'bg-primary text-ink' : 'text-text-muted hover:text-text',
            )
          }
        >
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
