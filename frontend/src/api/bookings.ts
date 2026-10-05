import { apiClient } from './client'
import type { Booking, BookingCreate, BookingPage, BookingStatus } from '@/types/api'

export type ListParams = {
  page?: number
  size?: number
}

export type ListBookingsParams = ListParams & {
  member_id?: number
  schedule_id?: number
  status_filter?: BookingStatus
  on_date?: string
}

export const bookingsApi = {
  async listForUser(userId: number, params: ListParams = {}): Promise<BookingPage> {
    const { data } = await apiClient.get<BookingPage>(`/users/${userId}/bookings`, { params })
    return data
  },

  async list(params: ListBookingsParams = {}): Promise<BookingPage> {
    const { data } = await apiClient.get<BookingPage>('/bookings', { params })
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
