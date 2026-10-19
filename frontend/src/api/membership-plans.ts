import { apiClient } from './client'
import type {
  MembershipPlan,
  MembershipPlanCreate,
  MembershipPlanPage,
  MembershipPlanUpdate,
} from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
  active_only?: boolean
}

export const membershipPlansApi = {
  async list(params: ListParams = {}): Promise<MembershipPlanPage> {
    const { data } = await apiClient.get<MembershipPlanPage>('/membership-plans', { params })
    return data
  },

  async get(id: number): Promise<MembershipPlan> {
    const { data } = await apiClient.get<MembershipPlan>(`/membership-plans/${id}`)
    return data
  },

  async create(payload: MembershipPlanCreate): Promise<MembershipPlan> {
    const { data } = await apiClient.post<MembershipPlan>('/membership-plans', payload)
    return data
  },

  async update(id: number, payload: MembershipPlanUpdate): Promise<MembershipPlan> {
    const { data } = await apiClient.put<MembershipPlan>(`/membership-plans/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/membership-plans/${id}`)
  },
}
