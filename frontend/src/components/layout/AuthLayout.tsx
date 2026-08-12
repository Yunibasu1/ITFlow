import type { ReactNode } from 'react'
import { motion } from 'motion/react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="itflow-grid-bg flex min-h-svh">
      <div className="itflow-drift" />
      <div
        className="itflow-glow left-[-6rem] top-[-4rem] h-72 w-72"
        style={{ background: '#22d3ee' }}
      />
      <div
        className="itflow-glow bottom-[-5rem] right-[-5rem] h-80 w-80"
        style={{ background: '#6366f1', animationDelay: '-5s' }}
      />
      <Particles />

      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <Logo />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              ITFlow
            </span>
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-white"
          >
            Incidencias TI,
            <br />
            <span className="text-cyan-400">bajo control.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4 max-w-md text-slate-400"
          >
            Centraliza, automatiza y resuelve los problemas de soporte en una
            sola plataforma.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex items-center gap-8"
          >
            <div>
              <p className="font-display text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-500">Tickets centralizados</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="font-display text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-slate-500">Seguimiento automático</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="font-display text-2xl font-bold text-cyan-400">IA</p>
              <p className="text-xs text-slate-500">Clasificación inteligente</p>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 text-xs text-slate-600"
        >
          ITFlow — Sistema inteligente de gestión de incidencias
        </motion.p>
      </aside>

      {/* Zona del formulario */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-center gap-3 lg:hidden"
          >
            <Logo />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              ITFlow
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function Logo() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md" />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-display text-base font-extrabold text-slate-950">
        IT
      </div>
    </div>
  )
}

const PARTICLE_STYLES = [
  { left: '5%', bottom: '-10px', animationDuration: '9s', animationDelay: '0s' },
  { left: '12%', bottom: '-10px', animationDuration: '13s', animationDelay: '-3s' },
  { left: '19%', bottom: '-10px', animationDuration: '8s', animationDelay: '-7s' },
  { left: '28%', bottom: '-10px', animationDuration: '12s', animationDelay: '-2s' },
  { left: '36%', bottom: '-10px', animationDuration: '10s', animationDelay: '-9s' },
  { left: '45%', bottom: '-10px', animationDuration: '14s', animationDelay: '-5s' },
  { left: '52%', bottom: '-10px', animationDuration: '9s', animationDelay: '-1s' },
  { left: '61%', bottom: '-10px', animationDuration: '12s', animationDelay: '-8s' },
  { left: '70%', bottom: '-10px', animationDuration: '8s', animationDelay: '-4s' },
  { left: '78%', bottom: '-10px', animationDuration: '13s', animationDelay: '-6s' },
  { left: '86%', bottom: '-10px', animationDuration: '10s', animationDelay: '-2s' },
  { left: '94%', bottom: '-10px', animationDuration: '11s', animationDelay: '-10s' },
]

function Particles() {
  return (
    <>
      {PARTICLE_STYLES.map((style, i) => (
        <div key={i} className="itflow-particle" style={style} />
      ))}
    </>
  )
}
