import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders the title and the message', () => {
    render(<ErrorState title="Algo salió mal" message="Inténtalo de nuevo." />)
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Inténtalo de nuevo.')).toBeInTheDocument()
  })

  it('renders the retry action and handles the click', async () => {
    const onRetry = vi.fn()
    render(
      <ErrorState
        title="Error"
        action={
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        }
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders the default alert icon', () => {
    const { container } = render(<ErrorState title="Error" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
