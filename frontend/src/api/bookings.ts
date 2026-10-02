import { apiClient } from './client'
import type { Booking, BookingCreate, BookingPage, MemberPage } from '@/types/schema'

export type ListParams = {
  page?: number
  size?: number
}

export const bookingsApi = {
  async listMine(params: ListParams = {}): Promise<BookingPage> {
    const { data } = await apiClient.get<BookingPage>('/members/me/bookings', { params })
    return data
  },

  async create(payload: BookingCreate): Promise<Booking> {
    const { data } = await apiClient.post<Booking>('/bookings', payload)
    return data
  },

  async cancel(id: number): Promise<void> {
    await apiClient.delete(`/bookings/${id}`)
  },
}

export const membersApi = {
  async list(params: ListParams = {}): Promise<MemberPage> {
    const { data } = await apiClient.get<MemberPage>('/members', { params })
    return data
  },
}
