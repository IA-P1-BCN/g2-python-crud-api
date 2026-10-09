import {
  QuickAccessTile,
  type QuickAccessTileProps,
} from '@/components/ui/molecules/QuickAccessTile'
import { cn } from '@/lib/cn'

export type QuickAccessItem = QuickAccessTileProps

export type QuickAccessGridProps = {
  items: QuickAccessItem[]
  className?: string
}

export function QuickAccessGrid({ items, className }: QuickAccessGridProps) {
  return (
    <nav
      className={cn('grid grid-cols-2 gap-4 sm:grid-cols-4', className)}
      aria-label="Accesos rápidos"
    >
      {items.map((item) => (
        <QuickAccessTile key={item.to} {...item} />
      ))}
    </nav>
  )
}
