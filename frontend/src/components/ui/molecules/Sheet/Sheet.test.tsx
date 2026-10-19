import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sheet, type SheetProps } from '@/components/ui/molecules/Sheet'

type HarnessProps = Pick<SheetProps, 'title'> & { onClose?: () => void }

function Harness({ title = 'Editar plan', onClose }: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Abrir
      </button>
      <Sheet
        title={title}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          onClose?.()
        }}
      >
        <button type="button">Guardar</button>
        <button type="button">Cancelar</button>
      </Sheet>
    </>
  )
}

async function openSheet() {
  await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
  return screen.getByRole('dialog')
}

describe('Sheet', () => {
  it('no está en el DOM cuando está cerrado', () => {
    render(
      <Sheet isOpen={false} onClose={vi.fn()} title="Editar plan">
        Contenido
      </Sheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pinta el título y el contenido cuando está abierto', async () => {
    render(<Harness />)
    const dialog = await openSheet()
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('expone role dialog, aria-modal y el nombre por el título', async () => {
    render(<Harness />)
    const dialog = await openSheet()
    expect(dialog).toHaveAttribute('role', 'dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Editar plan')
  })

  it('Escape llama a onClose', async () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    await openSheet()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el clic en el backdrop llama a onClose y el clic dentro no', async () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    const dialog = await openSheet()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(dialog.parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('el botón de cerrar llama a onClose', async () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    await openSheet()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('el foco no sale del panel: Tab desde el último vuelve al primero', async () => {
    render(<Harness />)
    await openSheet()

    const first = screen.getByRole('button', { name: 'Cerrar' })
    const last = screen.getByRole('button', { name: 'Cancelar' })

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('el foco vuelve al disparador al cerrar', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
})
