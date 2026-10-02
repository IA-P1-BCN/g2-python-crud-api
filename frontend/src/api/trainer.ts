import { apiClient } from './client'
import type { MemberPage } from '@/types/schema'
import type { ListParams } from './bookings'

export const trainerApi = {
  async listAssignedMembers(params: ListParams = {}): Promise<MemberPage> {
    const { data } = await apiClient.get<MemberPage>('/trainer/members', { params })
    return data
  },
}
