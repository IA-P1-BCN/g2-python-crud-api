import { apiClient } from './client'
import type { ClassPage, ClassSchedulePage } from '@/types/schema'

export type ListParams = {
  page?: number
  size?: number
}

export const classesApi = {
  async list(params: ListParams = {}): Promise<ClassPage> {
    const { data } = await apiClient.get<ClassPage>('/classes', { params })
    return data
  },
}

export const schedulesApi = {
  async list(params: ListParams = {}): Promise<ClassSchedulePage> {
    const { data } = await apiClient.get<ClassSchedulePage>('/class-schedules', { params })
    return data
  },
}
