import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface StatCardProps {
  label: string
  value: number | string
  accent?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red'
  icon?: ReactNode
  index?: number
}

const ACCENTS: Record<
  string,
  { text: string; chip: string; glow: string; bar: string }
> = {
  cyan: {
    text: 'text-cyan-300',
    chip: 'border-cyan-400/20 bg-cyan-500/15 text-cyan-300',
    glow: 'hover:shadow-[0_12px_44px_-14px_rgba(34,211,238,0.45)]',
    bar: 'from-cyan-400/0 via-cyan-400/60 to-cyan-400/0',
  },
  indigo: {
    text: 'text-indigo-300',
    chip: 'border-indigo-400/20 bg-indigo-500/15 text-indigo-300',
    glow: 'hover:shadow-[0_12px_44px_-14px_rgba(99,102,241,0.45)]',
    bar: 'from-indigo-400/0 via-indigo-400/60 to-indigo-400/0',
  },
  emerald: {
    text: 'text-emerald-300',
    chip: 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300',
    glow: 'hover:shadow-[0_12px_44px_-14px_rgba(52,211,153,0.45)]',
    bar: 'from-emerald-400/0 via-emerald-400/60 to-emerald-400/0',
  },
  amber: {
    text: 'text-amber-300',
    chip: 'border-amber-400/20 bg-amber-500/15 text-amber-300',
    glow: 'hover:shadow-[0_12px_44px_-14px_rgba(251,191,36,0.45)]',
    bar: 'from-amber-400/0 via-amber-400/60 to-amber-400/0',
  },
  red: {
    text: 'text-red-300',
    chip: 'border-red-400/20 bg-red-500/15 text-red-300',
    glow: 'hover:shadow-[0_12px_44px_-14px_rgba(248,113,113,0.45)]',
    bar: 'from-red-400/0 via-red-400/60 to-red-400/0',
  },
}

export function StatCard({
  label,
  value,
  accent = 'cyan',
  icon,
  index = 0,
}: StatCardProps) {
  const a = ACCENTS[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] ${a.glow}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-white/[0.07] to-transparent blur-2xl" />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${a.chip}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className={`font-display relative mt-3 text-3xl font-bold tabular-nums ${a.text}`}>
        {value}
      </p>
      <div
        className={`pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r ${a.bar} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
    </motion.div>
  )
}
