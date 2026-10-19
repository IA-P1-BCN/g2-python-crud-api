import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/lib/navigation'

export type TopNavProps = {
  items: NavItem[]
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
