import { apiRequest, apiUpload, getApiUrl } from '../../lib/apiClient'
import type { EventEntity } from '../../types/domain'
import { mockEvents } from './mockEvents'

export async function fetchEvents(): Promise<EventEntity[]> {
  if (!getApiUrl()) return mockEvents

  const data = await apiRequest<EventEntity[]>('/events')
  return data
}

export async function createEvent(formData: FormData): Promise<EventEntity> {
  return apiUpload<EventEntity>('/events', formData)
}
