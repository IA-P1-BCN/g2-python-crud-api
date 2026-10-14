import { apiClient } from './client'
import type {
  Membership,
  MembershipCreate,
  MembershipPage,
  MembershipStatus,
  MembershipUpdate,
} from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
  status_filter?: MembershipStatus
  user_id?: number
}

export const membershipsApi = {
  async list(params: ListParams = {}): Promise<MembershipPage> {
    const { data } = await apiClient.get<MembershipPage>('/memberships', { params })
    return data
  },

  async listForUser(userId: number, params: ListParams = {}): Promise<MembershipPage> {
    const { data } = await apiClient.get<MembershipPage>(`/users/${userId}/memberships`, { params })
    return data
  },

  async get(id: number): Promise<Membership> {
    const { data } = await apiClient.get<Membership>(`/memberships/${id}`)
    return data
  },

  async create(payload: MembershipCreate): Promise<Membership> {
    const { data } = await apiClient.post<Membership>('/memberships', payload)
    return data
  },

  async update(id: number, payload: MembershipUpdate): Promise<Membership> {
    const { data } = await apiClient.put<Membership>(`/memberships/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/memberships/${id}`)
  },
}
