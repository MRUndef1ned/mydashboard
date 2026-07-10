import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
          <p className="text-sm text-zinc-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
