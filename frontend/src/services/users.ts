import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Role, User } from '../types/User'

export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  const existing = await getDoc(userRef)
  if (existing.exists()) return

  const now = serverTimestamp()
  const fullName = name.trim().split(/\s+/)
  const firstName = fullName[0] ?? 'Usuario'
  const lastName = fullName.slice(1).join(' ')

  await setDoc(userRef, {
    name: firstName,
    lastname: lastName,
    email,
    role: 'user',
    department: '',
    position: '',
    phone: '',
    photoURL: '',
    status: 'active',
    emailNotifications: true,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as User
}

export async function updateUserProfile(
  uid: string,
  data: Partial<User>,
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() })
}

export async function listUsersByRole(role: Role): Promise<User[]> {
  const snapshot = await getDocs(
    query(collection(db, 'users'), where('role', '==', role)),
  )
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
}

export function subscribeAllUsers(callback: (users: User[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const list = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as User,
    )
    list.sort((a, b) => {
      const nameA = `${a.name} ${a.lastname}`.trim().toLowerCase()
      const nameB = `${b.name} ${b.lastname}`.trim().toLowerCase()
      return nameA.localeCompare(nameB)
    })
    callback(list)
  })
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    role,
    updatedAt: serverTimestamp(),
  })
}
