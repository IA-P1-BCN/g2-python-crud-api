import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/ui/organisms/AppHeader'
import { BottomNav } from '@/components/ui/organisms/BottomNav'
import { TopNav } from '@/components/ui/organisms/TopNav'
import { useAuth } from '@/auth'
import { navForRole } from '@/lib/navigation'
import type { Role } from '@/types/api'

const PROFILE_BY_ROLE: Record<Role, string> = {
  member: '/member/profile',
  trainer: '/trainer/profile',
  admin: '/admin/dashboard',
}

export function AppLayout() {
  const { user, logout } = useAuth()
  if (!user) return null

  const items = navForRole(user.role)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader
        name={user.full_name}
        role={user.role}
        onLogout={logout}
        profileHref={PROFILE_BY_ROLE[user.role]}
      />

      <div className="hidden border-b border-line md:block">
        <TopNav
          items={items}
          className="mx-auto w-full max-w-app px-4 py-2 md:max-w-page md:px-6"
        />
      </div>

      <main className="mx-auto w-full max-w-app flex-1 px-4 py-6 pb-28 md:max-w-page md:px-6 md:py-8 md:pb-6">
        <Outlet />
      </main>

      <div className="md:hidden">
        <BottomNav items={items} />
      </div>
    </div>
  )
}
