import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { loginUser, loginWithGoogle } from '../../services/auth'
import { redirectForRole } from '../../utils/roles'
import { useAuth } from '../../context/AuthContext'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Login() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(email, password)
      navigate(profile ? redirectForRole(profile.role) : '/', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(getAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Google login error:', err)
      setError(getAuthError(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Bienvenido
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Inicia sesión para gestionar tus incidencias.
        </p>
      </motion.div>

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

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <Input
            label="Contraseña"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<LockIcon />}
          />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <Button type="submit" loading={loading}>
            {!loading && <LoginIcon />}
            Entrar
          </Button>
        </motion.div>
      </form>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={5}
        className="my-5 flex items-center gap-3"
      >
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-slate-500">
          o
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
        <Button
          type="button"
          variant="secondary"
          loading={googleLoading}
          onClick={handleGoogle}
        >
          {!googleLoading && <GoogleIcon />}
          Continuar con Google
        </Button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={7}
        className="mt-6 space-y-2 text-center text-sm"
      >
        <p className="text-slate-400">
          ¿Olvidaste tu contraseña?{' '}
          <Link
            to="/forgot-password"
            className="text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Recuperar
          </Link>
        </p>
        <p className="text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Regístrate
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}

function getAuthError(err: unknown): string {
  const fbErr = err as { code?: string; message?: string }
  const code = fbErr?.code ?? ''
  const detail = fbErr?.message ?? ''
  switch (code) {
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.'
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.'
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.'
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/popup-closed-by-user':
      return 'Se canceló el inicio de sesión con Google.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite popups e inténtalo de nuevo.'
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado para Google Login. Agrégalo en Firebase Auth.'
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con este correo. Inicia sesión con tu contraseña.'
    case 'auth/operation-not-allowed':
      return 'El acceso con Google no está habilitado en Firebase.'
    case 'auth/network-request-failed':
      return 'Problema de conexión. Revisa tu internet.'
    default:
      return detail
        ? `Error: ${detail}`
        : 'No se pudo iniciar sesión. Inténtalo de nuevo.'
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

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.16 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.28v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.47 3.77 1.29 5.38l3.98-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.44C17.96 1.2 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  )
}
