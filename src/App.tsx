import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './shared/layout/AppLayout'
import { CurrentEventsPage } from './pages/CurrentEventsPage'
import { UpcomingEventsPage } from './pages/UpcomingEventsPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProfilePage } from './pages/ProfilePage'
import { CreateEventPage } from './pages/CreateEventPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ManagerRoute } from './features/auth/ManagerRoute'
import { useAuth } from './features/auth/useAuth'

function App() {
  const { session } = useAuth()

  return (
    <Routes>
      <Route
        path="/auth/login"
        element={session ? <Navigate to="/current" replace /> : <LoginPage />}
      />
      <Route
        path="/auth/register"
        element={session ? <Navigate to="/current" replace /> : <RegisterPage />}
      />
      <Route
        path="/auth/reset-password"
        element={session ? <Navigate to="/current" replace /> : <ResetPasswordPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/current" replace />} />
        <Route path="/current" element={<CurrentEventsPage />} />
        <Route path="/upcoming" element={<UpcomingEventsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/events/new"
          element={
            <ManagerRoute>
              <CreateEventPage />
            </ManagerRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/current" replace />} />
    </Routes>
  )
}

export default App
