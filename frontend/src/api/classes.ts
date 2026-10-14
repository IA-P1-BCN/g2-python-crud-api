import { apiClient } from './client'
import type {
  ClassSchedule,
  ClassScheduleCreate,
  ClassSchedulePage,
  ClassScheduleUpdate,
  GymClass,
  GymClassCreate,
  GymClassPage,
  GymClassUpdate,
} from '@/types/api'

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

  async get(id: number): Promise<GymClass> {
    const { data } = await apiClient.get<GymClass>(`/classes/${id}`)
    return data
  },

  async create(payload: GymClassCreate): Promise<GymClass> {
    const { data } = await apiClient.post<GymClass>('/classes', payload)
    return data
  },

  async update(id: number, payload: GymClassUpdate): Promise<GymClass> {
    const { data } = await apiClient.put<GymClass>(`/classes/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/classes/${id}`)
  },
}

export const schedulesApi = {
  async list(params: ListSchedulesParams = {}): Promise<ClassSchedulePage> {
    const { data } = await apiClient.get<ClassSchedulePage>('/class-schedules', { params })
    return data
  },

  async get(id: number): Promise<ClassSchedule> {
    const { data } = await apiClient.get<ClassSchedule>(`/class-schedules/${id}`)
    return data
  },

  async create(payload: ClassScheduleCreate): Promise<ClassSchedule> {
    const { data } = await apiClient.post<ClassSchedule>('/class-schedules', payload)
    return data
  },

  async update(id: number, payload: ClassScheduleUpdate): Promise<ClassSchedule> {
    const { data } = await apiClient.put<ClassSchedule>(`/class-schedules/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/class-schedules/${id}`)
  },
}
