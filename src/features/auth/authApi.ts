import type { Session } from '@supabase/supabase-js'
import { supabase, useMockAuth } from '../../lib/supabase'

const MOCK_USERS_KEY = 'mock_auth_users'
const MOCK_SESSION_KEY = 'mock_auth_session'
const mockListeners = new Set<(session: Session | null) => void>()

interface MockUser {
  id: string
  email: string
  password: string
  fullName: string
}

function createMockSession(email: string) {
  const id = crypto.randomUUID()
  return {
    access_token: `mock_access_${id}`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: `mock_refresh_${id}`,
    user: {
      id,
      email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  } as unknown as Session
}

function readMockUsers(): MockUser[] {
  const raw = localStorage.getItem(MOCK_USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as MockUser[]
  } catch {
    return []
  }
}

function saveMockUsers(users: MockUser[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function readMockSession() {
  const raw = localStorage.getItem(MOCK_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function saveMockSession(session: Session | null) {
  if (session) localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(MOCK_SESSION_KEY)
  mockListeners.forEach((listener) => listener(session))
}

export async function getCurrentSession() {
  if (useMockAuth || !supabase) return readMockSession()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  if (useMockAuth || !supabase) {
    mockListeners.add(callback)
    return () => mockListeners.delete(callback)
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}

export async function signIn(email: string, password: string) {
  if (useMockAuth || !supabase) {
    const users = readMockUsers()
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) {
      throw new Error('Неверный email или пароль')
    }
    saveMockSession(createMockSession(user.email))
    return
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function signUp(email: string, password: string, fullName: string) {
  if (useMockAuth || !supabase) {
    const users = readMockUsers()
    const exists = users.some((item) => item.email.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('Пользователь с таким email уже существует')

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email,
      password,
      fullName,
    }
    saveMockUsers([...users, newUser])
    return
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw new Error(error.message)
}

export async function resetPassword(email: string) {
  if (useMockAuth || !supabase) {
    const users = readMockUsers()
    const exists = users.some((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!exists) throw new Error('Пользователь с таким email не найден')
    return
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw new Error(error.message)
}

export async function signOut() {
  if (useMockAuth || !supabase) {
    saveMockSession(null)
    return
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
