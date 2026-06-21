import type { UserRole } from '../types/domain'

const API_URL = import.meta.env.VITE_API_URL as string | undefined
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export function getApiUrl(): string | undefined {
  return API_URL?.replace(/\/$/, '')
}

export function getStoredSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)
  if (!token || !userRaw) return null

  try {
    const user = JSON.parse(userRaw) as AuthUser
    return { token, user }
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string
      errors?: Record<string, string[]>
    }

    if (data.errors) {
      const firstError = Object.values(data.errors).flat()[0]
      if (firstError) return firstError
    }

    if (data.message) return data.message
  } catch {
    // ignore JSON parse errors
  }

  return `Ошибка запроса (${response.status})`
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const baseUrl = getApiUrl()
  if (!baseUrl) {
    throw new Error('API URL не настроен')
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const baseUrl = getApiUrl()
  if (!baseUrl) {
    throw new Error('API URL не настроен')
  }

  const headers = new Headers()
  headers.set('Accept', 'application/json')

  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as T
}
