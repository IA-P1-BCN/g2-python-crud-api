import { apiClient } from './client'
import type { MemberDashboard } from '@/types/api'

/** Current user's own data. */
export const meApi = {
  async dashboard(): Promise<MemberDashboard> {
    const { data } = await apiClient.get<MemberDashboard>('/me/dashboard')
    return data
  },
}
