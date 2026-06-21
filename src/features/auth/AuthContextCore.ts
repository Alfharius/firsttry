import { createContext } from 'react'
import type { AuthSession } from '../../lib/apiClient'

export interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
