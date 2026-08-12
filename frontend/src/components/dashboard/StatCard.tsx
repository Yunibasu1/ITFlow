import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface StatCardProps {
  label: string
  value: number | string
  accent?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'red'
  icon?: ReactNode
  index?: number
}

const ACCENTS: Record<string, string> = {
  cyan: 'text-cyan-400',
  indigo: 'text-indigo-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
}

export function StatCard({ label, value, accent = 'cyan', icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && <span className={`${ACCENTS[accent]}`}>{icon}</span>}
      </div>
      <p className={`font-display mt-2 text-3xl font-bold ${ACCENTS[accent]}`}>{value}</p>
    </motion.div>
  )
}
