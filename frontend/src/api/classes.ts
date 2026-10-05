import { apiClient } from './client'
import type { ClassSchedulePage, GymClassPage } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
}

export type ListClassesParams = ListParams & {
  trainer_id?: number
  active_only?: boolean
}

export type ListSchedulesParams = ListParams & {
  class_id?: number
  day_of_week?: number
}

export const classesApi = {
  async list(params: ListClassesParams = {}): Promise<GymClassPage> {
    const { data } = await apiClient.get<GymClassPage>('/classes', { params })
    return data
  },
}

export const schedulesApi = {
  async list(params: ListSchedulesParams = {}): Promise<ClassSchedulePage> {
    const { data } = await apiClient.get<ClassSchedulePage>('/class-schedules', { params })
    return data
  },
}
