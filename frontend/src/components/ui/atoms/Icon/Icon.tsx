import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Eye,
  EyeOff,
  House,
  Info,
  Lock,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const ICONS = {
  home: House,
  users: Users,
  user: User,
  dumbbell: Dumbbell,
  calendar: Calendar,
  'calendar-plus': CalendarPlus,
  settings: Settings,
  'log-out': LogOut,
  eye: Eye,
  'eye-off': EyeOff,
  plus: Plus,
  search: Search,
  check: Check,
  info: Info,
  lock: Lock,
  mail: Mail,
  x: X,
  'arrow-right': ArrowRight,
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
