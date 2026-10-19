import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, type AuthContextValue } from '@/auth'
import { TrainerHomePage } from '@/pages/trainer/TrainerHomePage'
import { useTrainerToday, type UseTrainerTodayResult } from '@/pages/trainer/useTrainerToday'
import type { User } from '@/types/api'

vi.mock('@/auth', () => ({ useAuth: vi.fn() }))
vi.mock('@/pages/trainer/useTrainerToday', () => ({ useTrainerToday: vi.fn() }))

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseTrainerToday = vi.mocked(useTrainerToday)

const trainer: User = {
  id: 2,
  email: 'trainer@example.com',
  full_name: 'Entrenador Uno',
  role: 'trainer',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  deactivated_at: null,
}

const session = {
  id: 10,
  title: 'Yoga',
  time: '10:00 – 11:00',
  room: 'Sala 1',
  enrolled: 12,
  capacity: 20,
  attendees: [{ id: 1, name: 'Ana' }],
}

function authValue(partial: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    hasRole: vi.fn(),
    ...partial,
  }
}

function todayValue(partial: Partial<UseTrainerTodayResult> = {}): UseTrainerTodayResult {
  return {
    sessionCount: 2,
    memberCount: 5,
    nextSession: session,
    sessions: [session],
    isLoading: false,
    isError: false,
    error: null,
    ...partial,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TrainerHomePage />
    </MemoryRouter>,
  )
}

describe('TrainerHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue(
      authValue({ user: trainer, token: 'token', isAuthenticated: true }),
    )
    mockedUseTrainerToday.mockReturnValue(todayValue())
  })

  it('saluda, muestra las métricas, la próxima sesión y la lista de hoy', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Hola, Entrenador Uno' })).toBeInTheDocument()
    expect(screen.getByText('Sesiones hoy')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Miembros hoy')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sesiones de hoy' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Ver inscritos' }).length).toBeGreaterThan(0)
  })

  it('muestra el error de la API y oculta el resumen', () => {
    mockedUseTrainerToday.mockReturnValue(todayValue({ isError: true, error: new Error('boom') }))

    renderPage()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Sesiones hoy')).not.toBeInTheDocument()
  })
})
