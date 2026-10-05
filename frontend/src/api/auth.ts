import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, Token, User } from '@/types/api'

/**
 * Provisional auth contract: the backend does not expose JWT endpoints yet
 * (issues #82-#86). Paths are relative to `/api/v1`, so the calls target
 * `/api/v1/auth/*` as expected.
 */
export const authApi = {
  async login(payload: LoginRequest): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterRequest): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/register', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}
