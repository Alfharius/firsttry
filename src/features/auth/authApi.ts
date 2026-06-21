import {
  apiRequest,
  getStoredSession,
  saveSession,
  type AuthSession,
  type AuthUser,
} from '../../lib/apiClient'

export type { AuthSession, AuthUser }

const listeners = new Set<(session: AuthSession | null) => void>()

function notifyListeners(session: AuthSession | null) {
  listeners.forEach((listener) => listener(session))
}

export async function getCurrentSession() {
  const stored = getStoredSession()
  if (!stored) return null

  try {
    const user = await apiRequest<AuthUser>('/auth/me')
    const session = { token: stored.token, user }
    saveSession(session)
    return session
  } catch {
    saveSession(null)
    notifyListeners(null)
    return null
  }
}

export function onAuthStateChange(callback: (session: AuthSession | null) => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export async function signIn(email: string, password: string) {
  const data = await apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })

  saveSession(data)
  notifyListeners(data)
}

export async function signUp(email: string, password: string, fullName: string) {
  await apiRequest('/auth/register', {
    method: 'POST',
    body: { email, password, fullName },
    auth: false,
  })
}

export async function resetPassword(email: string) {
  await apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  })
}

export async function signOut() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } catch {
    // ignore logout errors when token already invalid
  }

  saveSession(null)
  notifyListeners(null)
}
