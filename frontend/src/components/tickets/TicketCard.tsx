import { Link } from 'react-router-dom'
import type { Ticket } from '../../types/Ticket'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { SlaBadge } from './SlaBadge'
import { timeAgo } from '../../utils/format'
import { ChevronRightIcon, ClockIcon } from '../ui/icons'

export function TicketCard({ ticket, basePath }: { ticket: Ticket; basePath: string }) {
  return (
    <Link
      to={`${basePath}/${ticket.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-cyan-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-cyan-400">
            {ticket.ticketNumber}
          </p>
          <h3 className="mt-1 truncate font-medium text-white group-hover:text-cyan-300">
            {ticket.title}
          </h3>
        </div>
        <ChevronRightIcon className="shrink-0 text-slate-600 transition-colors group-hover:text-cyan-400" />
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{ticket.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <SlaBadge ticket={ticket} />
        {ticket.category && (
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">
            {ticket.category}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <ClockIcon width={14} height={14} />
        {timeAgo(ticket.createdAt)}
      </p>
    </Link>
  )
}
