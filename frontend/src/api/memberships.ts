import { apiClient } from './client'
import type { Membership } from '@/types/schema'

export const membershipsApi = {
  /** Current (or latest) membership of the authenticated member. */
  async mine(): Promise<Membership> {
    const { data } = await apiClient.get<Membership>('/members/me/membership')
    return data
  },
}
