import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeAllTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { StatusDistribution } from '../../components/dashboard/StatusDistribution'
import { SlaRiskList } from '../../components/dashboard/SlaRiskList'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket } from '../../types/Ticket'
import { getSlaStatus } from '../../utils/sla'
import { useNow } from '../../hooks/useNow'
import { TicketIcon, AlertIcon, CheckIcon, WrenchIcon } from '../../components/ui/icons'

export function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const now = useNow()

  useEffect(() => subscribeAllTickets(setTickets), [])

  const open = tickets.filter((t) =>
    ['new', 'pending', 'assigned', 'in_progress', 'waiting_user', 'reopened', 'escalated'].includes(
      t.status,
    ),
  ).length
  const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
  const critical = tickets.filter(
    (t) => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled',
  ).length
  const slaRisk = tickets.filter((t) => {
    const sla = getSlaStatus(t, now)
    return sla !== null && sla.level !== 'ok'
  }).length
  const recent = tickets.slice(0, 5)

  return (
    <AppShell title="Panel de administración">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Tickets totales" value={tickets.length} accent="cyan" index={0} icon={<TicketIcon />} />
        <StatCard label="Abiertos" value={open} accent="indigo" index={1} icon={<AlertIcon />} />
        <StatCard label="Críticos activos" value={critical} accent="red" index={2} icon={<WrenchIcon />} />
        <StatCard label="Resueltos" value={resolved} accent="emerald" index={3} icon={<CheckIcon />} />
        <StatCard
          label="SLA en riesgo"
          value={slaRisk}
          accent={slaRisk > 0 ? 'red' : 'emerald'}
          index={4}
          icon={<AlertIcon />}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <StatusDistribution tickets={tickets} title="Distribución de estados" showClosed />
        <SlaRiskList tickets={tickets} basePath="/admin/tickets" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Tickets recientes</h2>
        <Link to="/admin/tickets" className="text-sm text-cyan-400 hover:text-cyan-300">
          Ver todos →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {recent.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-slate-400">Aún no hay tickets.</p>
          </div>
        )}
        {recent.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} basePath="/admin/tickets" />
        ))}
      </div>
    </AppShell>
  )
}
