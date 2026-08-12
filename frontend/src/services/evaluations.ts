import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Evaluation } from '../types/Evaluation'

export async function getEvaluationForTicket(
  ticketId: string,
): Promise<Evaluation | null> {
  const snapshot = await getDocs(
    query(collection(db, 'evaluations'), where('ticketId', '==', ticketId)),
  )
  if (snapshot.empty) return null
  const data = snapshot.docs[0].data() as Record<string, unknown>
  return {
    id: snapshot.docs[0].id,
    ticketId: data.ticketId as string,
    userId: data.userId as string,
    rating: data.rating as number,
    comment: (data.comment as string) ?? '',
    createdAt: data.createdAt as Date,
  }
}

export async function createEvaluation(input: {
  ticketId: string
  userId: string
  rating: number
  comment: string
}): Promise<void> {
  await addDoc(collection(db, 'evaluations'), {
    ticketId: input.ticketId,
    userId: input.userId,
    rating: input.rating,
    comment: input.comment,
    createdAt: serverTimestamp(),
  })
}
