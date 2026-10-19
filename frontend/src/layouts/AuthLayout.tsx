import { Link, Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/atoms/Logo'
import { SiteFooter } from '@/components/ui/organisms/SiteFooter'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow/60 blur-3xl"
      />

      <header className="relative flex items-center border-b border-line bg-surface px-4 py-3">
        <Link to="/" aria-label="Ir al inicio">
          <Logo />
        </Link>
      </header>

      <main className="relative mx-auto flex w-full max-w-app flex-1 flex-col items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      <SiteFooter className="relative" />
    </div>
  )
}
