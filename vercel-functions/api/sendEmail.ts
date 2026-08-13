import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

const FIREBASE_SA = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

if (!FIREBASE_SA) {
  throw new Error('Falta variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON')
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(FIREBASE_SA)) })
}

const auth = getAuth()
const db = getFirestore()

const TYPE_LABELS: Record<string, string> = {
  ticket: 'Nuevo ticket',
  comment: 'Nuevo comentario',
  status: 'Cambio de estado',
  assign: 'Ticket asignado',
  system: 'Aviso del sistema',
}

const TYPE_ICONS: Record<string, string> = {
  ticket: '🎫',
  comment: '💬',
  status: '🔁',
  assign: '👤',
  system: 'ℹ️',
}

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return transporter
}

function buildHtml(input: {
  fullName: string
  title: string
  body: string
  type: string
  url: string
}): string {
  const label = TYPE_LABELS[input.type] ?? 'Notificación'
  const icon = TYPE_ICONS[input.type] ?? '🔔'
  const bodyHtml = input.body
    ? `<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">${input.body}</p>`
    : ''
  return `
<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr>
        <td style="background:linear-gradient(135deg,#22d3ee,#6366f1);padding:28px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:-0.5px;">ITFlow</span>
          <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:2px;">Sistema de gestión de incidencias TI</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <div style="font-size:26px;margin-bottom:8px;">${icon}</div>
          <h2 style="margin:0 0 4px;font-size:18px;color:#0f172a;">${label}</h2>
          <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Hola ${input.fullName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${input.title}</p>
          ${bodyHtml}
          <div style="margin-top:24px;">
            <a href="${input.url}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#6366f1);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">Ver en ITFlow</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #f1f5f9;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
            Recibes este correo porque tienes notificaciones activadas en ITFlow.<br/>
            No respondas a este mensaje. Para cambiar tus preferencias, entra a tu cuenta y ajusta las notificaciones de la campana.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `
}

interface EmailPayload {
  userId: string
  title?: string
  body?: string
  type?: string
  link?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.status(204).end()
    return
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    res.status(500).json({ error: 'Servidor mal configurado (SMTP)' })
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

  let decoded
  try {
    decoded = await auth.verifyIdToken(token)
  } catch {
    res.status(401).json({ error: 'No autorizado' })
    return
  }

  const payload = (req.body ?? {}) as EmailPayload
  const userId = payload.userId || decoded.uid
  if (!userId) {
    res.status(400).json({ error: 'Falta userId' })
    return
  }

  try {
    const userSnap = await db.collection('users').doc(userId).get()
    if (!userSnap.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    const user = userSnap.data() as Record<string, unknown>
    const email = (user.email as string) ?? ''
    if (!email) {
      res.status(400).json({ error: 'El usuario no tiene correo' })
      return
    }

    if (user.emailNotifications === false) {
      res.json({ success: true, skipped: 'emailNotifications' })
      return
    }

    const fullName =
      `${(user.name as string) ?? ''} ${(user.lastname as string) ?? ''}`.trim() ||
      'Usuario'

    const title = (payload.title as string) ?? 'Tienes una nueva notificación'
    const body = (payload.body as string) ?? ''
    const type = (payload.type as string) ?? 'system'
    const link = (payload.link as string) ?? ''

    const baseUrl = process.env.APP_URL ?? 'https://itflow-4a74b.web.app'
    const url = link
      ? `${baseUrl}${link.startsWith('/') ? link : `/${link}`}`
      : baseUrl

    const fromName = process.env.SMTP_FROM_NAME ?? 'ITFlow'
    await getTransporter().sendMail({
      from: `${fromName} <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${TYPE_LABELS[type] ?? 'Notificación'} · ${title}`,
      html: buildHtml({ fullName, title, body, type, url }),
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Error enviando email de notificación', err)
    res.status(500).json({ error: 'Error al enviar el email' })
  }
}
