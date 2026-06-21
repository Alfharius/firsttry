import { apiRequest, getApiUrl } from '../../lib/apiClient'
import type { UserProfile } from '../../types/domain'

const fallbackProfile: UserProfile = {
  fullName: 'Мария Иванова',
  email: 'manager@click2mice.ru',
  position: 'Менеджер по мероприятиям',
  role: 'manager',
  company: null,
}

export async function fetchCurrentProfile(): Promise<UserProfile> {
  if (!getApiUrl()) return fallbackProfile

  return apiRequest<UserProfile>('/profile')
}

export async function updateCurrentProfile(profile: Pick<UserProfile, 'fullName' | 'position'>) {
  if (!getApiUrl()) return

  await apiRequest<UserProfile>('/profile', {
    method: 'PUT',
    body: {
      fullName: profile.fullName,
      position: profile.position,
    },
  })
}

export async function changeCurrentUserPassword(currentPassword: string, newPassword: string) {
  if (!getApiUrl()) return

  await apiRequest('/auth/password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  })
}
