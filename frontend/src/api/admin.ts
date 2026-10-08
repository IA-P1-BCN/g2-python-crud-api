import { apiClient } from './client'
import type { DashboardPeriod, DashboardSummary } from '@/types/api'

export const adminApi = {
  async dashboard(period: DashboardPeriod = '7d'): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>('/admin/dashboard', {
      params: { period },
    })
    return data
  },
}
