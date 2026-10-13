import type { IconName } from '@/components/ui/atoms/Icon'
import type { Role } from '@/types/api'

export type NavItem = {
  to: string
  label: string
  icon: IconName
}

/** Single source of the navigation menu per role. */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  member: [
    { to: '/member', label: 'Inicio', icon: 'home' },
    { to: '/member/bookings', label: 'Reservas', icon: 'calendar' },
    { to: '/member/membership', label: 'Mi plan', icon: 'dumbbell' },
  ],
  trainer: [
    { to: '/trainer', label: 'Inicio', icon: 'home' },
    { to: '/trainer/sessions', label: 'Sesiones', icon: 'calendar' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/admin/members', label: 'Socios', icon: 'users' },
    { to: '/admin/plans', label: 'Planes', icon: 'dumbbell' },
  ],
}

export function navForRole(role: Role): NavItem[] {
  return NAV_BY_ROLE[role]
}
