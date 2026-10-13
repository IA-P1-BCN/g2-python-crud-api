import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/atoms/Avatar'
import { Logo } from '@/components/ui/atoms/Logo'
import { cn } from '@/lib/cn'
import { ROLE_LABELS } from '@/lib/roles'
import type { Role } from '@/types/api'

export type AppHeaderProps = {
  name: string
  role: Role
  onLogout: () => void
  avatarSrc?: string
  /** Route opened from "Mi perfil". */
  profileHref?: string
  /** Product name shown in the logo. */
  productName?: string
  className?: string
}

export function AppHeader({
  name,
  role,
  onLogout,
  avatarSrc,
  profileHref = '/member/profile',
  productName,
  className,
}: AppHeaderProps) {
  const [open, setOpen] = useState(false)

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') setOpen(false)
  }

  return (
    <header
      className={cn('flex items-center justify-between gap-3 bg-surface px-4 py-3', className)}
    >
      <Logo name={productName} subtitle={ROLE_LABELS[role]} />

      <div className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          aria-label="Cuenta"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex rounded-full"
        >
          <Avatar name={name} src={avatarSrc} size="sm" />
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Cuenta"
            className="absolute right-0 z-10 mt-2 flex w-44 flex-col rounded-tile border border-line bg-surface p-1 shadow-glow-primary"
          >
            <Link
              role="menuitem"
              to={profileHref}
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 text-body text-text hover:bg-surface-sunken"
            >
              Mi perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="rounded px-3 py-2 text-left text-body text-text hover:bg-surface-sunken"
            >
              Cerrar sesión
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
