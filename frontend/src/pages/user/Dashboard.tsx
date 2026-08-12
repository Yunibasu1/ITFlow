import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { subscribeUserTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { SlaRiskList } from '../../components/dashboard/SlaRiskList'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket } from '../../types/Ticket'
import { OPEN_STATUSES } from '../../utils/ticket'
import { getSlaStatus } from '../../utils/sla'
import { useNow } from '../../hooks/useNow'
import { PlusIcon, TicketIcon, AlertIcon, CheckIcon } from '../../components/ui/icons'

export function UserDashboard() {
  const { currentUser } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const now = useNow()

  useEffect(() => {
    if (!currentUser) return
    return subscribeUserTickets(currentUser.uid, setTickets)
  }, [currentUser])

  const total = tickets.length
  const open = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length
  const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
  const critical = tickets.filter(
    (t) => t.priority === 'critical' && OPEN_STATUSES.includes(t.status),
  ).length
  const slaRisk = tickets.filter((t) => {
    const sla = getSlaStatus(t, now)
    return sla !== null && sla.level !== 'ok'
  }).length
  const recent = tickets.slice(0, 5)

  return (
    <AppShell title="Panel de usuario">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Mis incidencias" value={total} accent="cyan" index={0} icon={<TicketIcon />} />
        <StatCard label="Abiertas" value={open} accent="indigo" index={1} icon={<AlertIcon />} />
        <StatCard label="Resueltas" value={resolved} accent="emerald" index={2} icon={<CheckIcon />} />
        <StatCard label="Críticas abiertas" value={critical} accent="red" index={3} icon={<AlertIcon />} />
        <StatCard
          label="SLA en riesgo"
          value={slaRisk}
          accent={slaRisk > 0 ? 'red' : 'emerald'}
          index={4}
          icon={<AlertIcon />}
        />
      </div>

      {slaRisk > 0 && (
        <div className="mt-8">
          <SlaRiskList tickets={tickets} basePath="/user/tickets" title="Tickets que necesitan atención" />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Últimas incidencias</h2>
        <Link
          to="/user/tickets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <PlusIcon />
          Nueva incidencia
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {recent.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-slate-400">
              Aún no tienes incidencias. Crea la primera con el botón superior.
            </p>
          </div>
        )}
        {recent.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} basePath="/user/tickets" />
        ))}
      </div>
    </AppShell>
  )
}
