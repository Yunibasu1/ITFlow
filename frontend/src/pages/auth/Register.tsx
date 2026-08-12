import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { registerUser } from '../../services/auth'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await registerUser(name, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Register error:', err)
      setError(getRegisterError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Crear cuenta
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Empieza a gestionar tus incidencias.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <Input
            label="Nombre completo"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            icon={<UserIcon />}
          />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
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
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <Input
            label="Contraseña"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            icon={<LockIcon />}
          />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            icon={<LockIcon />}
          />
        </motion.div>

        {error && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <Button type="submit" loading={loading}>
            {!loading && <RegisterIcon />}
            Registrarme
          </Button>
        </motion.div>
      </form>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={7}
        className="mt-6 text-center text-sm text-slate-400"
      >
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-cyan-400 transition-colors hover:text-cyan-300">
          Inicia sesión
        </Link>
      </motion.p>
    </AuthLayout>
  )
}

function getRegisterError(err: unknown): string {
  const fbErr = err as { code?: string; message?: string }
  const code = fbErr?.code ?? ''
  const detail = fbErr?.message ?? ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.'
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil.'
    case 'auth/operation-not-allowed':
      return 'El registro no está habilitado actualmente.'
    default:
      return detail
        ? `Error: ${detail}`
        : 'No se pudo crear la cuenta. Inténtalo de nuevo.'
  }
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m2 7 10 7L22 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function RegisterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  )
}
