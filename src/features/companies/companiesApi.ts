import { apiRequest, getApiUrl } from '../../lib/apiClient'
import type { Company } from '../../types/domain'

export async function fetchCompanies(): Promise<Company[]> {
  if (!getApiUrl()) return []

  return apiRequest<Company[]>('/companies')
}
