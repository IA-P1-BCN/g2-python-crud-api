import { apiClient } from './client'
import type { Plan, PlanCreate, PlanPage, PlanUpdate } from '@/types/schema'

export type ListPlansParams = {
  page?: number
  size?: number
  activeOnly?: boolean
}

export const plansApi = {
  async list(params: ListPlansParams = {}): Promise<PlanPage> {
    const { data } = await apiClient.get<PlanPage>('/plans', { params })
    return data
  },

  async get(id: number): Promise<Plan> {
    const { data } = await apiClient.get<Plan>(`/plans/${id}`)
    return data
  },

  async create(payload: PlanCreate): Promise<Plan> {
    const { data } = await apiClient.post<Plan>('/plans', payload)
    return data
  },

  async update(id: number, payload: PlanUpdate): Promise<Plan> {
    const { data } = await apiClient.patch<Plan>(`/plans/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/plans/${id}`)
  },
}
