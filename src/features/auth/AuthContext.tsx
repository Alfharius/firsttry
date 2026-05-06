import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { getCurrentSession, onAuthStateChange, signOut } from './authApi'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getCurrentSession()
      .then((currentSession) => {
        if (mounted) setSession(currentSession)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      loading,
      logout: signOut,
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return context
}
