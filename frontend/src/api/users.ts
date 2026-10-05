import { apiClient } from './client'
import type { Role, UserPage } from '@/types/api'

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
}
