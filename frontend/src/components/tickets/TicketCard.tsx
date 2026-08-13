import { Link } from 'react-router-dom'
import type { Priority, Ticket } from '../../types/Ticket'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { SlaBadge } from './SlaBadge'
import { timeAgo } from '../../utils/format'
import { ChevronRightIcon, ClockIcon } from '../ui/icons'

const PRIORITY_EDGE: Record<Priority, string> = {
  low: 'from-emerald-400/50 to-transparent',
  medium: 'from-yellow-400/50 to-transparent',
  high: 'from-orange-400/60 to-transparent',
  critical: 'from-red-400/70 to-transparent',
}

export function TicketCard({ ticket, basePath }: { ticket: Ticket; basePath: string }) {
  return (
    <Link
      to={`${basePath}/${ticket.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 pl-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.06] hover:shadow-[0_14px_44px_-18px_rgba(34,211,238,0.4)]"
    >
      <span
        className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${PRIORITY_EDGE[ticket.priority]}`}
      />
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-white/[0.05] to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold tracking-wide text-cyan-400">
            {ticket.ticketNumber}
          </p>
          <h3 className="mt-1 truncate font-medium text-white transition-colors group-hover:text-cyan-200">
            {ticket.title}
          </h3>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-600 transition-all group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10 group-hover:text-cyan-300">
          <ChevronRightIcon width={15} height={15} />
        </span>
      </div>

      <p className="relative mt-1.5 line-clamp-2 text-sm text-slate-400">
        {ticket.description}
      </p>

      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <SlaBadge ticket={ticket} />
        {ticket.category && (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-400">
            {ticket.category}
          </span>
        )}
      </div>

      <p className="relative mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <ClockIcon width={14} height={14} />
        {timeAgo(ticket.createdAt)}
      </p>
    </Link>
  )
}
