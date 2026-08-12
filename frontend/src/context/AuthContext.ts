import { createContext, useContext } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '../types/User'

export interface AuthContextValue {
  currentUser: FirebaseUser | null
  profile: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
