import { Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './useAuth'

export function ManagerRoute({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Проверяем сессию...</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  if (session.user.role !== 'manager') {
    return <Navigate to="/current" replace />
  }

  return children
}
