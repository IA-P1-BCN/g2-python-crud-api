import { apiClient, MAX_PAGE_SIZE } from './client'
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

  /**
   * Every booking of a user, walking all pages. The endpoint sorts by id and has no date filter,
   * so the first page alone would miss the newest bookings of a long-time member.
   */
  async listAllForUser(userId: number): Promise<Booking[]> {
    const first = await bookingsApi.listForUser(userId, { page: 1, size: MAX_PAGE_SIZE })
    const items = [...first.items]
    for (let page = 2; page <= first.pages; page++) {
      items.push(...(await bookingsApi.listForUser(userId, { page, size: MAX_PAGE_SIZE })).items)
    }
    return items
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
