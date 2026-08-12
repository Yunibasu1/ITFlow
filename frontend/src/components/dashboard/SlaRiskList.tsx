import { Link } from 'react-router-dom'
import type { Ticket } from '../../types/Ticket'
import {
  getSlaStatus,
  formatTimeRemaining,
  SLA_LEVEL_STYLES,
} from '../../utils/sla'
import { CheckIcon } from '../ui/icons'
import { useNow } from '../../hooks/useNow'

export function SlaRiskList({
  tickets,
  basePath,
  title = 'SLA en riesgo',
}: {
  tickets: Ticket[]
  basePath: string
  title?: string
}) {
  const now = useNow()

  const atRisk = tickets
    .map((ticket) => ({ ticket, sla: getSlaStatus(ticket, now) }))
    .filter((x): x is { ticket: Ticket; sla: NonNullable<ReturnType<typeof getSlaStatus>> } =>
      x.sla !== null && x.sla.level !== 'ok',
    )
    .sort((a, b) => {
      const msA =
        a.sla.activeDeadline === 'response' ? a.sla.responseMs : a.sla.resolutionMs
      const msB =
        b.sla.activeDeadline === 'response' ? b.sla.responseMs : b.sla.resolutionMs
      return msA - msB
    })
    .slice(0, 6)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
        {atRisk.length > 0 && (
          <span className="ml-2 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
            {atRisk.length}
          </span>
        )}
      </p>

      {atRisk.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
          <CheckIcon width={15} height={15} />
          Todo dentro del SLA
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {atRisk.map(({ ticket, sla }) => {
            const ms = sla.activeDeadline === 'response' ? sla.responseMs : sla.resolutionMs
            return (
              <Link
                key={ticket.id}
                to={`${basePath}/${ticket.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5 transition-colors hover:border-cyan-400/30 hover:bg-slate-900/70"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${sla.level === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-cyan-400">
                    {ticket.ticketNumber}
                  </p>
                  <p className="truncate text-sm text-slate-300">{ticket.title}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${SLA_LEVEL_STYLES[sla.level]}`}
                >
                  {formatTimeRemaining(ms)}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
