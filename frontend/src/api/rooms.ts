import { apiClient } from './client'
import type { Room, RoomCreate, RoomPage, RoomUpdate } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
}

export const roomsApi = {
  async list(params: ListParams = {}): Promise<RoomPage> {
    const { data } = await apiClient.get<RoomPage>('/rooms', { params })
    return data
  },

  async create(payload: RoomCreate): Promise<Room> {
    const { data } = await apiClient.post<Room>('/rooms', payload)
    return data
  },

  async update(id: number, payload: RoomUpdate): Promise<Room> {
    const { data } = await apiClient.put<Room>(`/rooms/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/rooms/${id}`)
  },
}
