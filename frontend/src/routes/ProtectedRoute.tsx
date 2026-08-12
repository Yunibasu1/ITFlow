import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/User'
import { redirectForRole } from '../utils/roles'

interface ProtectedRouteProps {
  roles?: Role[]
  children: ReactNode
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { currentUser, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <MissingProfileScreen />
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to={redirectForRole(profile.role)} replace />
  }

  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-950">
      <div className="text-slate-400">Cargando…</div>
    </div>
  )
}

function MissingProfileScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <p className="text-white">
          No se pudo cargar tu perfil. Recarga la página o vuelve a iniciar
          sesión.
        </p>
        <a href="/login" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
          Ir al login
        </a>
      </div>
    </div>
  )
}

export function RedirectByRole() {
  const { currentUser, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!profile) return <MissingProfileScreen />
  return <Navigate to={redirectForRole(profile.role)} replace />
}
