import { apiClient } from './client'
import type { Role, User, UserCreate, UserPage, UserUpdate } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
  role?: Role
  is_active?: boolean
  /** Text in the name or the email. */
  search?: string
  /** Signup and sign-off date ranges, as YYYY-MM-DD, both ends included. */
  created_from?: string
  created_to?: string
  deactivated_from?: string
  deactivated_to?: string
}

export const usersApi = {
  async list(params: ListParams = {}): Promise<UserPage> {
    const { data } = await apiClient.get<UserPage>('/users', { params })
    return data
  },

  async create(payload: UserCreate): Promise<User> {
    const { data } = await apiClient.post<User>('/users', payload)
    return data
  },

  async update(id: number, payload: UserUpdate): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${id}`, payload)
    return data
  },

  /** Signs the user off: the account is deactivated, never deleted. */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },

  async reactivate(id: number): Promise<User> {
    return usersApi.update(id, { is_active: true })
  },

  async exportMembersCsv(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>('/export/members.csv', {
      params: { role: 'member' },
      responseType: 'blob',
    })
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
