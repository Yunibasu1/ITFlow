import { auth } from './firebase'

const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined

export interface N8nTicketPayload {
  ticketId: string
  ticketNumber: string
  title: string
  description: string
  category: string
  subcategory: string
  priority: string
  department: string
  userName: string
  userEmail: string
  createdAt: string
}

/**
 * Dispara el análisis IA del ticket en la función serverless de Vercel (fire-and-forget).
 * Autentica con el token de sesión del usuario actual (nunca se envían secretos).
 * La app funciona igual si la función está caída o no configurada.
 */
export async function triggerTicketAnalysis(payload: N8nTicketPayload): Promise<void> {
  if (!N8N_URL) return
  try {
    const user = auth.currentUser
    if (!user) return
    const idToken = await user.getIdToken()
    await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('Análisis IA no disponible (análisis omitido):', err)
  }
}
