import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  House,
  LogOut,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const ICONS = {
  home: House,
  users: Users,
  dumbbell: Dumbbell,
  calendar: Calendar,
  'calendar-plus': CalendarPlus,
  settings: Settings,
  'log-out': LogOut,
  plus: Plus,
  search: Search,
  check: Check,
  x: X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'alert-triangle': TriangleAlert,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS
export type IconSize = 16 | 20 | 24

const SIZE_CLASS: Record<IconSize, string> = {
  16: 'size-4',
  20: 'size-5',
  24: 'size-6',
}

export type IconProps = {
  name: IconName
  size?: IconSize
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  const Cmp = ICONS[name]
  return <Cmp aria-hidden="true" className={cn(SIZE_CLASS[size], className)} />
}