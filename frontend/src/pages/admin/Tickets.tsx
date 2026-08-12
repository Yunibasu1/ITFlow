import { useEffect, useMemo, useState } from 'react'
import { subscribeAllTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket, TicketStatus } from '../../types/Ticket'
import { PRIORITY_LABELS } from '../../types/Ticket'
import { SearchIcon } from '../../components/ui/icons'

type StatusFilter = 'all' | 'open' | 'resolved' | 'closed'
type PriorityFilter = 'all' | Ticket['priority']

const OPEN_STATUSES: TicketStatus[] = [
  'new',
  'analyzing',
  'pending',
  'assigned',
  'in_progress',
  'waiting_user',
  'reopened',
  'escalated',
]

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => subscribeAllTickets(setTickets), [])

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (statusFilter === 'open' && !OPEN_STATUSES.includes(t.status)) return false
        if (statusFilter === 'resolved' && t.status !== 'resolved') return false
        if (statusFilter === 'closed' && t.status !== 'closed') return false
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
        if (search.trim()) {
          const q = search.trim().toLowerCase()
          if (
            !t.title.toLowerCase().includes(q) &&
            !t.ticketNumber.toLowerCase().includes(q) &&
            !t.description.toLowerCase().includes(q)
          ) {
            return false
          }
        }
        return true
      }),
    [tickets, statusFilter, priorityFilter, search],
  )

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    }),
    [tickets],
  )

  return (
    <AppShell title="Gestión de tickets">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado:</span>
        {([
          { key: 'all', label: `Todos (${counts.all})` },
          { key: 'open', label: `Abiertos (${counts.open})` },
          { key: 'resolved', label: `Resueltos (${counts.resolved})` },
          { key: 'closed', label: `Cerrados (${counts.closed})` },
        ] as Array<{ key: StatusFilter; label: string }>).map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prioridad:</span>
        <button
          onClick={() => setPriorityFilter('all')}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            priorityFilter === 'all'
              ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
              : 'border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          Todas
        </button>
        {(['critical', 'high', 'medium', 'low'] as Ticket['priority'][]).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              priorityFilter === p
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-slate-400">No hay tickets que coincidan con los filtros.</p>
          </div>
        )}
        {filtered.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} basePath="/admin/tickets" />
        ))}
      </div>
    </AppShell>
  )
}
