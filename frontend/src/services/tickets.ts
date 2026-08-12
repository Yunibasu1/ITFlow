import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Ticket, TicketStatus, Priority } from '../types/Ticket'
import type { Comment } from '../types/Comment'

const COUNTER_DOC = doc(db, 'system_configs', 'counters')
const TICKET_PREFIX = 'IT'

const SLA_DEFAULTS: Record<Priority, { responseHours: number; resolutionHours: number }> = {
  critical: { responseHours: 1, resolutionHours: 4 },
  high: { responseHours: 2, resolutionHours: 8 },
  medium: { responseHours: 4, resolutionHours: 24 },
  low: { responseHours: 8, resolutionHours: 48 },
}

export interface CreateTicketInput {
  userId: string
  department: string
  title: string
  description: string
  category: string
  subcategory: string
  priority: Priority
}

export interface CreatedTicket {
  id: string
  ticketNumber: string
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return new Date(String(value))
}

export function mapTicket(doc: DocumentSnapshot): Ticket {
  const data = doc.data() as Record<string, unknown>
  const sla = data.sla as Record<string, unknown> | null | undefined
  const ai = data.aiAnalysis as Record<string, unknown> | null | undefined
  return {
    id: doc.id,
    ticketNumber: (data.ticketNumber as string) ?? '',
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as string) ?? '',
    subcategory: (data.subcategory as string) ?? '',
    priority: (data.priority as Priority) ?? 'medium',
    status: (data.status as TicketStatus) ?? 'new',
    userId: (data.userId as string) ?? '',
    assignedTo: (data.assignedTo as string | null) ?? null,
    department: (data.department as string) ?? '',
    aiAnalysis: ai
      ? {
          category: (ai.category as string) ?? '',
          subcategory: (ai.subcategory as string) ?? '',
          priority: (ai.priority as Priority) ?? 'medium',
          summary: (ai.summary as string) ?? '',
          problem_type: (ai.problem_type as string) ?? '',
          suggested_solution: (ai.suggested_solution as string) ?? '',
          model: (ai.model as string) ?? '',
          analyzedAt: toDate(ai.analyzedAt),
        }
      : null,
    sla: sla
      ? {
          responseHours: sla.responseHours as number,
          resolutionHours: sla.resolutionHours as number,
          responseDeadline: toDate(sla.responseDeadline),
          resolutionDeadline: toDate(sla.resolutionDeadline),
          responseMet: (sla.responseMet as boolean | null) ?? null,
          resolutionMet: (sla.resolutionMet as boolean | null) ?? null,
          violated: (sla.violated as boolean) ?? false,
        }
      : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    assignedAt: data.assignedAt ? toDate(data.assignedAt) : null,
    resolvedAt: data.resolvedAt ? toDate(data.resolvedAt) : null,
    closedAt: data.closedAt ? toDate(data.closedAt) : null,
  }
}

function padNumber(n: number): string {
  return String(n).padStart(6, '0')
}

export async function createTicket(input: CreateTicketInput): Promise<CreatedTicket> {
  const slaDefaults = SLA_DEFAULTS[input.priority]
  const now = new Date()

  const created = await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(COUNTER_DOC)
    const next = (counterSnap.data()?.ticketCounter as number | undefined) ?? 0
    const nextNumber = next + 1

    tx.set(
      COUNTER_DOC,
      { ticketCounter: nextNumber, updatedAt: serverTimestamp() },
      { merge: true },
    )

    const ticketRef = doc(collection(db, 'tickets'))
    tx.set(ticketRef, {
      ticketNumber: `${TICKET_PREFIX}-${padNumber(nextNumber)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      subcategory: input.subcategory,
      priority: input.priority,
      status: 'new',
      userId: input.userId,
      assignedTo: null,
      department: input.department,
      aiAnalysis: null,
      sla: {
        responseHours: slaDefaults.responseHours,
        resolutionHours: slaDefaults.resolutionHours,
        responseDeadline: Timestamp.fromDate(
          new Date(now.getTime() + slaDefaults.responseHours * 3600_000),
        ),
        resolutionDeadline: Timestamp.fromDate(
          new Date(now.getTime() + slaDefaults.resolutionHours * 3600_000),
        ),
        responseMet: null,
        resolutionMet: null,
        violated: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      assignedAt: null,
      resolvedAt: null,
      closedAt: null,
    })

    return {
      id: ticketRef.id,
      ticketNumber: `${TICKET_PREFIX}-${padNumber(nextNumber)}`,
    }
  })

  return created
}

export function subscribeUserTickets(
  userId: string,
  callback: (tickets: Ticket[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapTicket)))
}

export function subscribeTechnicianTickets(
  technicianId: string,
  callback: (tickets: Ticket[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    where('assignedTo', '==', technicianId),
    orderBy('createdAt', 'desc'),
    limit(100),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapTicket)))
}

export function subscribeUnassignedTickets(
  callback: (tickets: Ticket[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    where('assignedTo', '==', null),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapTicket)))
}

export function subscribeAllTickets(
  callback: (tickets: Ticket[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    orderBy('createdAt', 'desc'),
    limit(200),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapTicket)))
}

export function subscribeRecentTickets(
  callback: (tickets: Ticket[]) => void,
  n = 5,
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    orderBy('createdAt', 'desc'),
    limit(n),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapTicket)))
}

export async function updateTicket(
  id: string,
  data: Partial<Ticket>,
): Promise<void> {
  await updateDoc(doc(db, 'tickets', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function assignTicket(id: string, technicianId: string): Promise<void> {
  await updateDoc(doc(db, 'tickets', id), {
    assignedTo: technicianId,
    assignedAt: serverTimestamp(),
    status: 'assigned',
    updatedAt: serverTimestamp(),
  })
}

export async function changeStatus(
  id: string,
  status: TicketStatus,
): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  }
  if (status === 'resolved') payload.resolvedAt = serverTimestamp()
  if (status === 'closed' || status === 'cancelled') {
    payload.closedAt = serverTimestamp()
  }
  if (status === 'closed' || status === 'cancelled' || status === 'reopened') {
    payload.resolvedAt = null
  }
  await updateDoc(doc(db, 'tickets', id), payload)
}

export async function addComment(
  ticketId: string,
  userId: string,
  body: string,
): Promise<void> {
  await addDoc(collection(db, 'comments'), {
    ticketId,
    userId,
    body,
    createdAt: serverTimestamp(),
  })
}

export function subscribeComments(
  ticketId: string,
  callback: (comments: Comment[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'comments'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, (snapshot) =>
    callback(
      snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          ticketId: data.ticketId as string,
          userId: data.userId as string,
          body: data.body as string,
          createdAt: toDate(data.createdAt),
        }
      }),
    ),
  )
}
