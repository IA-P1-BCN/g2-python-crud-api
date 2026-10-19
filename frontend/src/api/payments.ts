import { apiClient } from './client'
import type { PaymentPage, PaymentStatus } from '@/types/api'

export type ListPaymentsParams = {
  page?: number
  size?: number
  user_id?: number
  status_filter?: PaymentStatus
}

/** Payments are admin-only (`/payments`). */
export const paymentsApi = {
  async list(params: ListPaymentsParams = {}): Promise<PaymentPage> {
    const { data } = await apiClient.get<PaymentPage>('/payments', { params })
    return data
  },
}
