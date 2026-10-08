import { apiClient } from './client'
import type { Role, User, UserPage } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
  role?: Role
}

export const usersApi = {
  async list(params: ListParams = {}): Promise<UserPage> {
    const { data } = await apiClient.get<UserPage>('/users', { params })
    return data
  },

  async updateProfile(id: number, payload: { email?: string; full_name?: string }): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${id}/profile`, payload)
    return data
  },

  async changePassword(
    id: number,
    payload: { current_password: string; new_password: string },
  ): Promise<void> {
    await apiClient.put(`/users/${id}/password`, payload)
  },
}
