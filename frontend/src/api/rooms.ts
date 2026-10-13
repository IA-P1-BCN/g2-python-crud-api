import { apiClient } from './client'
import type { RoomPage } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
}

export const roomsApi = {
  async list(params: ListParams = {}): Promise<RoomPage> {
    const { data } = await apiClient.get<RoomPage>('/rooms', { params })
    return data
  },
}
