import type { Role } from '@/types/schema'

export const HOME_BY_ROLE: Record<Role, string> = {
  member: '/member',
  trainer: '/trainer',
  admin: '/admin',
}

export function homePathForRole(role: Role): string {
  return HOME_BY_ROLE[role]
}
