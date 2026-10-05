import { apiClient } from './client'
import type { Membership, MembershipPage } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
}

export const membershipsApi = {
  async listForUser(userId: number, params: ListParams = {}): Promise<MembershipPage> {
    const { data } = await apiClient.get<MembershipPage>(`/users/${userId}/memberships`, { params })
    return data
  },

  async get(id: number): Promise<Membership> {
    const { data } = await apiClient.get<Membership>(`/memberships/${id}`)
    return data
  },
}
