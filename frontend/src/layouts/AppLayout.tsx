import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sheet } from '@/components/ui/molecules/Sheet'
import { AppHeader } from '@/components/ui/organisms/AppHeader'
import { SideNav } from '@/components/ui/organisms/SideNav'
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
  const [isNavOpen, setIsNavOpen] = useState(false)
  if (!user) return null

  const items = navForRole(user.role)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader
        name={user.full_name}
        role={user.role}
        onLogout={logout}
        profileHref={PROFILE_BY_ROLE[user.role]}
        onOpenNav={() => setIsNavOpen(true)}
      />

      {/* Same container as the header so the sidebar, the logo and the content share their edges. */}
      <div className="mx-auto flex w-full max-w-app md:max-w-none">
        <aside className="hidden shrink-0 border-r border-line bg-surface lg:block">
          <SideNav items={items} className="w-64 gap-1 px-6 py-4" />
        </aside>

        <main className="min-w-0 max-w-page flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>

      <Sheet isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} title="Menú">
        <SideNav items={items} onNavigate={() => setIsNavOpen(false)} />
      </Sheet>
    </div>
  )
}
