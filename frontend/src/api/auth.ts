import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, Token, User } from '@/types/api'

/** JWT auth endpoints. Paths are relative to `/api/v1`. */
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
