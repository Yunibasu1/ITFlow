import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { sendNotificationEmail } from './emailNotifications.js'

initializeApp()
const db = getFirestore()
const auth = getAuth()

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

const ALLOWED_CATEGORIES = [
  'hardware',
  'software',
  'network',
  'access',
  'email',
  'security',
  'printers',
  'systems',
  'other',
]
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'critical']

interface TicketPayload {
  ticketId: string
  ticketNumber: string
  title: string
  description: string
  category?: string
  subcategory?: string
  priority?: string
  department?: string
  userName?: string
  userEmail?: string
  createdAt?: string
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

function buildPrompt(item: TicketPayload): string {
  const category = item.category || 'other'
  const priority = item.priority || 'medium'
  const userLabel = item.userName
    ? `${item.userName} (${item.userEmail || ''})`
    : item.userEmail || 'usuario'
  return (
    "Eres un asistente de soporte TI. Clasifica la incidencia que te dan y responde SOLO con un JSON valido (sin texto adicional) con estas claves: category (una de: hardware, software, network, access, email, security, printers, systems, other), subcategory (subcategoria corta en minusculas, ej: wifi, laptop, outlook, credenciales, impresora), priority (una de: low, medium, high, critical), summary (resumen de 8 a 15 palabras), problem_type (tipo corto de problema, ej: connectivity, auth, performance, hardware_failure), suggested_solution (posible solucion en espanol, 1 a 2 frases).\n\n" +
      `Ticket: ${item.ticketNumber}\n` +
      `Titulo: ${item.title}\n` +
      `Descripcion: ${item.description}\n` +
      `Categoria declarada por el usuario: ${category}\n` +
      `Prioridad declarada por el usuario: ${priority}\n` +
      `Departamento: ${item.department || 'N/D'}\n` +
      `Usuario: ${userLabel}`
  )
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  })
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return text
}

function sanitize(raw: string, original: TicketPayload): {
  category: string
  subcategory: string
  priority: string
  summary: string
  problemType: string
  solution: string
} {
  let ai: Record<string, unknown> = {}
  try {
    ai = JSON.parse(raw) as Record<string, unknown>
  } catch {
    ai = {}
  }
  const aiCategory = String(ai.category || '').toLowerCase()
  const aiPriority = String(ai.priority || '').toLowerCase()
  return {
    category: ALLOWED_CATEGORIES.includes(aiCategory)
      ? aiCategory
      : String(original.category || 'other').toLowerCase(),
    subcategory: String(ai.subcategory || '').slice(0, 40),
    priority: ALLOWED_PRIORITIES.includes(aiPriority)
      ? aiPriority
      : String(original.priority || 'medium').toLowerCase(),
    summary: String(ai.summary || original.title || '').slice(0, 200),
    problemType: String(ai.problem_type || 'general').slice(0, 40),
    solution: String(ai.suggested_solution || '').slice(0, 500),
  }
}

export const classifyTicket = onRequest(
  { cors: true, maxInstances: 1 },
  async (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY

    if (!geminiKey) {
      logger.error('Falta variable de entorno GEMINI_API_KEY')
      res.status(500).json({ error: 'Servidor mal configurado' })
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) {
      res.status(401).json({ error: 'No autorizado' })
      return
    }

    try {
      await auth.verifyIdToken(token)
    } catch {
      res.status(401).json({ error: 'No autorizado' })
      return
    }

    const payload = req.body as TicketPayload
    if (!payload || !payload.ticketId || !payload.title) {
      res.status(400).json({ error: 'Datos del ticket incompletos' })
      return
    }

    try {
      const prompt = buildPrompt(payload)
      const raw = await callGemini(prompt, geminiKey)
      const safe = sanitize(raw, payload)
      const now = Timestamp.now()

      await db.collection('tickets').doc(payload.ticketId).update({
        aiAnalysis: {
          category: safe.category,
          subcategory: safe.subcategory,
          priority: safe.priority,
          summary: safe.summary,
          problem_type: safe.problemType,
          suggested_solution: safe.solution,
          model: 'gemini-flash-latest',
          analyzedAt: now,
        },
        updatedAt: FieldValue.serverTimestamp(),
      })

      res.json({ success: true, ticketId: payload.ticketId })
    } catch (err) {
      logger.error('Error analizando ticket', err)
      res.status(500).json({ error: 'Error al analizar el ticket' })
    }
  }
)
