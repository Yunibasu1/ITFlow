import { auth } from './firebase'

const EMAIL_FUNCTION_URL = import.meta.env
  .VITE_EMAIL_FUNCTION_URL as string | undefined

export interface EmailNotificationInput {
  userId: string
  title: string
  body: string
  type: string
  link: string
}

/**
 * Dispara el envío del email de notificación en la función serverless de Vercel
 * (fire-and-forget). Autentica con el token de sesión del usuario actual
 * (nunca se envían secretos). La app funciona igual si la función está caída
 * o no configurada.
 */
export async function triggerEmailNotification(
  input: EmailNotificationInput,
): Promise<void> {
  if (!EMAIL_FUNCTION_URL) return
  try {
    const user = auth.currentUser
    if (!user) return
    const idToken = await user.getIdToken()
    await fetch(EMAIL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(input),
    })
  } catch (err) {
    console.warn('Email de notificación no enviado:', err)
  }
}
