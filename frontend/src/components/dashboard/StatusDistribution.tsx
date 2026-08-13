import type { Ticket, TicketStatus } from '../../types/Ticket'
import { STATUS_BAR_COLORS } from '../../utils/ticket'
import { TICKET_STATUS_LABELS } from '../../types/Ticket'
import { motion } from 'motion/react'
import { ChartIcon } from '../ui/icons'

const ORDER: TicketStatus[] = [
  'new',
  'analyzing',
  'pending',
  'assigned',
  'in_progress',
  'waiting_user',
  'reopened',
  'escalated',
  'resolved',
  'closed',
  'cancelled',
]

export function StatusDistribution({
  tickets,
  title = 'Distribución',
  showClosed = false,
}: {
  tickets: Ticket[]
  title?: string
  showClosed?: boolean
}) {
  const scope = showClosed ? ORDER : ORDER.slice(0, 8)
  const counts = scope.map((status) => ({
    status,
    count: tickets.filter((t) => t.status === status).length,
  }))
  const present = counts.filter((c) => c.count > 0)
  const total = present.reduce((sum, c) => sum + c.count, 0)

  if (total === 0) {
    return (
      <div className="itflow-panel p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300">
            <ChartIcon width={14} height={14} />
          </span>
          {title}
        </p>
        <p className="mt-3 text-sm text-slate-500">Sin datos todavía.</p>
      </div>
    )
  }

  const legend = [...present].sort((a, b) => b.count - a.count).slice(0, 6)

  return (
    <div className="itflow-panel p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300">
            <ChartIcon width={14} height={14} />
          </span>
          {title}
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300">
          {total} tickets
        </span>
      </div>

      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {present.map(({ status, count }) => (
          <motion.div
            key={status}
            initial={{ width: 0 }}
            animate={{ width: `${(count / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full ${STATUS_BAR_COLORS[status]}`}
            title={`${TICKET_STATUS_LABELS[status]}: ${count}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {legend.map(({ status, count }) => (
          <div key={status} className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_BAR_COLORS[status]}`}
            />
            <span className="truncate text-slate-400">
              {TICKET_STATUS_LABELS[status]}
            </span>
            <span className="ml-auto font-semibold text-slate-200">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
