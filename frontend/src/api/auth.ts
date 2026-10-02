import { apiClient } from './client'
import type { LoginRequest, Token, User } from '@/types/schema'

export const authApi = {
  async login(payload: LoginRequest): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/login', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}
