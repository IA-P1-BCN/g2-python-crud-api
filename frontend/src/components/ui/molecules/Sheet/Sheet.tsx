import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@/components/ui/atoms/IconButton'
import { cn } from '@/lib/cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type SheetProps = {
  /** Whether the sheet is rendered. */
  isOpen: boolean
  /** Called whenever the user closes it: Escape, backdrop click or the close button. */
  onClose: () => void
  /** Dialog heading; also the accessible name of the dialog. */
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Bottom sheet on mobile, centred dialog from `md`, with focus trap, Escape to
 * close and body scroll locked while open.
 */
export function Sheet({ isOpen, onClose, title, children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim md:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'flex w-full max-w-md flex-col gap-4 rounded-t-card border border-line bg-surface p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:m-4 md:rounded-card',
          className,
        )}
      >
        <div className={cn('flex items-start gap-4', title ? 'justify-between' : 'justify-end')}>
          {title ? (
            <h2 id={titleId} className="font-display text-headline text-text">
              {title}
            </h2>
          ) : null}
          <IconButton icon="x" label="Cerrar" variant="ghost" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
