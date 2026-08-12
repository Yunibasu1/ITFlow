import { useEffect, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { subscribeComments, mapTicket } from '../services/tickets'
import type { Ticket } from '../types/Ticket'
import type { Comment } from '../types/Comment'

export function useTicket(ticketId: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    setLoading(true)
    setNotFound(false)
    setError('')

    const unsubscribeTicket = onSnapshot(
      doc(db, 'tickets', ticketId),
      (snapshot) => {
        if (!active) return
        if (!snapshot.exists()) {
          setNotFound(true)
          setTicket(null)
        } else {
          setTicket(mapTicket(snapshot))
        }
        setLoading(false)
      },
      (err: unknown) => {
        console.error('Error cargando ticket:', err)
        if (active) {
          setError('No se pudo cargar el ticket.')
          setLoading(false)
        }
      },
    )

    const unsubscribeComments = subscribeComments(ticketId, (list) => {
      if (active) setComments(list)
    })

    return () => {
      active = false
      unsubscribeTicket()
      unsubscribeComments()
    }
  }, [ticketId])

  return { ticket, comments, loading, notFound, error }
}
