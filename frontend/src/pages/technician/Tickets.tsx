import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeTechnicianTickets, subscribeUnassignedTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket } from '../../types/Ticket'
import { SearchIcon } from '../../components/ui/icons'

type Scope = 'assigned' | 'unassigned'
type StatusFilter = 'all' | 'open' | 'resolved' | 'critical'

export function TechnicianTickets() {
  const { currentUser } = useAuth()
  const [assigned, setAssigned] = useState<Ticket[]>([])
  const [unassigned, setUnassigned] = useState<Ticket[]>([])
  const [scope, setScope] = useState<Scope>('assigned')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!currentUser) return
    const unsubA = subscribeTechnicianTickets(currentUser.uid, setAssigned)
    const unsubU = subscribeUnassignedTickets(setUnassigned)
    return () => {
      unsubA()
      unsubU()
    }
  }, [currentUser])

  const source = scope === 'assigned' ? assigned : unassigned

  const filtered = source.filter((t) => {
    if (statusFilter === 'open' && !['new', 'pending', 'assigned', 'in_progress', 'waiting_user', 'reopened', 'escalated'].includes(t.status)) return false
    if (statusFilter === 'resolved' && t.status !== 'resolved') return false
    if (statusFilter === 'critical' && t.priority !== 'critical') return false
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
  })

  return (
    <AppShell title="Tickets">
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
        <div className="flex gap-2">
          <button
            onClick={() => setScope('assigned')}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              scope === 'assigned'
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Asignados ({assigned.length})
          </button>
          <button
            onClick={() => setScope('unassigned')}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              scope === 'unassigned'
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Por aceptar ({unassigned.length})
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {([
          { key: 'all', label: 'Todos' },
          { key: 'open', label: 'Abiertos' },
          { key: 'resolved', label: 'Resueltos' },
          { key: 'critical', label: 'Críticos' },
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

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-slate-400">
              {scope === 'unassigned'
                ? 'No hay tickets por aceptar.'
                : 'No hay tickets asignados que coincidan.'}
            </p>
          </div>
        )}
        {filtered.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} basePath="/technician/tickets" />
        ))}
      </div>
    </AppShell>
  )
}
