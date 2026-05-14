import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../types/domain'

const fallbackProfile: UserProfile = {
  fullName: 'Aruzhan Omarova',
  email: 'aruzhan@events.kz',
  position: 'Event Manager',
}

interface ProfileRow {
  full_name: string
  position: string
}

export async function fetchCurrentProfile() {
  if (!supabase) return fallbackProfile

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return fallbackProfile

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, position')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return {
      fullName: user.user_metadata?.full_name ?? fallbackProfile.fullName,
      email: user.email ?? fallbackProfile.email,
      position: fallbackProfile.position,
    }
  }

  const profile = data as ProfileRow
  return {
    fullName: profile.full_name,
    email: user.email ?? fallbackProfile.email,
    position: profile.position,
  }
}

export async function updateCurrentProfile(profile: UserProfile) {
  if (!supabase) return

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Пользователь не авторизован')
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: profile.fullName,
    position: profile.position,
  })

  if (error) {
    throw new Error(`Не удалось сохранить профиль: ${error.message}`)
  }
}

export async function changeCurrentUserPassword(newPassword: string) {
  if (!supabase) return

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    throw new Error(`Не удалось сменить пароль: ${error.message}`)
  }
}
