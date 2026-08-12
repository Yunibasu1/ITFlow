import { useEffect, useState, type ReactNode } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '../types/User'
import { onAuthChange } from '../services/auth'
import { getUserProfile, createUserProfile } from '../services/users'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        let userProfile = await getUserProfile(user.uid).catch(() => null)

        if (!userProfile) {
          await createUserProfile(
            user.uid,
            user.displayName ?? 'Usuario',
            user.email ?? '',
          ).catch(() => {})
          userProfile = await getUserProfile(user.uid).catch(() => null)
        }

        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
