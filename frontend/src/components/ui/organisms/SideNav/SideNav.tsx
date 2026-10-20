import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/atoms/Icon'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/lib/navigation'

export type SideNavProps = {
  items: NavItem[]
  className?: string
  /** Called after a link is picked, so the mobile menu can close itself. */
  onNavigate?: () => void
}

/**
 * Vertical navigation list. It backs the desktop sidebar and, inside a Sheet,
 * the mobile hamburger menu, so both show exactly the same links.
 */
export function SideNav({ items, className, onNavigate }: SideNavProps) {
  return (
    <nav aria-label="Navegación principal" className={cn('flex flex-col gap-1', className)}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-tile px-4 py-3 text-body transition-colors',
              isActive
                ? 'bg-primary text-ink'
                : 'text-text-muted hover:bg-surface-sunken hover:text-text',
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
