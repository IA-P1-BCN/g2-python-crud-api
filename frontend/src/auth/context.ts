import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Role, User } from '@/types/api'

export type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginRequest) => Promise<User>
  register: (payload: RegisterRequest) => Promise<User>
  /** Closes the session: revokes it on the server (best-effort) and clears the tokens. */
  logout: () => Promise<void>
  updateUser: (user: User) => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
