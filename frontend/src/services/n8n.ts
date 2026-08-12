const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined
const N8N_SECRET = import.meta.env.VITE_N8N_WEBHOOK_SECRET as string | undefined

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
 * Dispara el análisis IA del ticket en n8n (fire-and-forget).
 * La app funciona igual si n8n está caído o no configurado.
 */
export async function triggerTicketAnalysis(payload: N8nTicketPayload): Promise<void> {
  if (!N8N_URL) return
  try {
    await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_SECRET ? { 'x-itflow-secret': N8N_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('n8n no disponible (análisis IA omitido):', err)
  }
}
