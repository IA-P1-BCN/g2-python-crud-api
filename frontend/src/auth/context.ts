import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Role, User } from '@/types/schema'

export type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginRequest) => Promise<User>
  register: (payload: RegisterRequest) => Promise<User>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
