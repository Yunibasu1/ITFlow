import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { resetPassword } from '../../services/auth'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      console.error('Reset error:', err)
      setError(getResetError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Recuperar contraseña
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Te enviaremos un enlace para restablecerla.
        </p>
      </motion.div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-400"
        >
          Si el correo existe, te enviamos un enlace para restablecer tu
          contraseña. Revisa tu bandeja de entrada.
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@empresa.com"
              icon={<MailIcon />}
            />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <Button type="submit" loading={loading}>
              {!loading && <SendIcon />}
              Enviar enlace
            </Button>
          </motion.div>
        </form>
      )}

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={3}
        className="mt-6 text-center text-sm text-slate-400"
      >
        <Link to="/login" className="text-cyan-400 transition-colors hover:text-cyan-300">
          Volver a iniciar sesión
        </Link>
      </motion.p>
    </AuthLayout>
  )
}

function getResetError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.'
    default:
      return 'No se pudo enviar el enlace. Inténtalo de nuevo.'
  }
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m2 7 10 7L22 7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 2-11 11" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  )
}
