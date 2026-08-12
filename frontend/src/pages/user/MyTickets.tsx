import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { subscribeUserTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket } from '../../types/Ticket'
import { OPEN_STATUSES } from '../../utils/ticket'
import { PlusIcon, SearchIcon } from '../../components/ui/icons'

type Filter = 'all' | 'open' | 'resolved' | 'closed' | 'cancelled'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'open', label: 'Abiertas' },
  { key: 'resolved', label: 'Resueltas' },
  { key: 'closed', label: 'Cerradas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export function UserTickets() {
  const { currentUser } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!currentUser) return
    return subscribeUserTickets(currentUser.uid, setTickets)
  }, [currentUser])

  const filtered = tickets.filter((t) => {
    if (filter === 'all') {
      // sin filtro
    } else if (filter === 'open') {
      if (!OPEN_STATUSES.includes(t.status)) return false
    } else if (filter === 'resolved') {
      if (t.status !== 'resolved') return false
    } else if (t.status !== filter) {
      return false
    }
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
    <AppShell title="Mis incidencias">
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
        <Link
          to="/user/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <PlusIcon />
          Nueva incidencia
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
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
            <p className="text-slate-400">No hay incidencias que coincidan.</p>
          </div>
        )}
        {filtered.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} basePath="/user/tickets" />
        ))}
      </div>
    </AppShell>
  )
}
