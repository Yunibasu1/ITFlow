import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  updateDoc,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { listUsersByRole } from './users'
import { triggerEmailNotification } from './emailNotifications'
import type { Role } from '../types/User'

export type NotificationType =
  | 'ticket'
  | 'comment'
  | 'status'
  | 'assign'
  | 'system'

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  type: NotificationType
  ticketId: string
  link: string
  read: boolean
  createdAt: Date
}

export interface NotificationInput {
  userId: string
  title: string
  body: string
  type: NotificationType
  ticketId?: string
  link: string
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return new Date(String(value))
}

export async function createNotification(
  input: NotificationInput,
): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    ticketId: input.ticketId ?? '',
    link: input.link,
    read: false,
    createdAt: serverTimestamp(),
  })
  triggerEmailNotification(input).catch(() => {})
}

export function notifyUser(
  userId: string,
  input: Omit<NotificationInput, 'userId'>,
): Promise<void> {
  return createNotification({ ...input, userId })
}

export async function notifyRole(
  roles: Role[],
  build: (role: Role) => Omit<NotificationInput, 'userId'>,
): Promise<void> {
  const jobs = await Promise.all(
    roles.map(async (role) => {
      const users = await listUsersByRole(role)
      return users.map((u) => createNotification({ ...build(role), userId: u.id }))
    }),
  )
  await Promise.all(jobs.flat())
}

export function subscribeNotifications(
  userId: string,
  callback: (items: AppNotification[]) => void,
): Unsubscribe {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId))
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        userId: data.userId as string,
        title: (data.title as string) ?? '',
        body: (data.body as string) ?? '',
        type: (data.type as NotificationType) ?? 'system',
        ticketId: (data.ticketId as string) ?? '',
        link: (data.link as string) ?? '',
        read: (data.read as boolean) ?? false,
        createdAt: toDate(data.createdAt),
      }
    })
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(list)
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { read: true })
}

export async function markAllNotificationsRead(
  unreadIds: string[],
): Promise<void> {
  if (unreadIds.length === 0) return
  const batch = writeBatch(db)
  unreadIds.forEach((id) =>
    batch.update(doc(db, 'notifications', id), { read: true }),
  )
  await batch.commit()
}
