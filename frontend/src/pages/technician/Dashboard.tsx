import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { subscribeTechnicianTickets, subscribeUnassignedTickets } from '../../services/tickets'
import { AppShell } from '../../components/layout/AppShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { StatusDistribution } from '../../components/dashboard/StatusDistribution'
import { SlaRiskList } from '../../components/dashboard/SlaRiskList'
import { TicketCard } from '../../components/tickets/TicketCard'
import type { Ticket } from '../../types/Ticket'
import { getSlaStatus } from '../../utils/sla'
import { useNow } from '../../hooks/useNow'
import { TicketIcon, WrenchIcon, CheckIcon, AlertIcon } from '../../components/ui/icons'

export function TechnicianDashboard() {
  const { currentUser } = useAuth()
  const [assigned, setAssigned] = useState<Ticket[]>([])
  const [unassigned, setUnassigned] = useState<Ticket[]>([])
  const now = useNow()

  useEffect(() => {
    if (!currentUser) return
    const unsubA = subscribeTechnicianTickets(currentUser.uid, setAssigned)
    const unsubU = subscribeUnassignedTickets(setUnassigned)
    return () => {
      unsubA()
      unsubU()
    }
  }, [currentUser])

  const inProgress = assigned.filter((t) => t.status === 'in_progress').length
  const pending = assigned.filter((t) =>
    ['assigned', 'waiting_user', 'reopened'].includes(t.status),
  ).length
  const resolved = assigned.filter((t) => t.status === 'resolved').length
  const critical = unassigned.filter(
    (t) => t.priority === 'critical' && ['new', 'pending'].includes(t.status),
  ).length

  const allVisible = [...unassigned, ...assigned]
  const slaRisk = allVisible.filter((t) => {
    const sla = getSlaStatus(t, now)
    return sla !== null && sla.level !== 'ok'
  }).length

  return (
    <AppShell title="Panel del técnico">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Mis tickets" value={assigned.length} accent="cyan" index={0} icon={<TicketIcon />} />
        <StatCard label="En progreso" value={inProgress} accent="indigo" index={1} icon={<WrenchIcon />} />
        <StatCard label="Pendientes" value={pending} accent="amber" index={2} icon={<AlertIcon />} />
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
        <StatusDistribution tickets={allVisible} title="Distribución de estados" />
        <SlaRiskList tickets={allVisible} basePath="/technician/tickets" />
      </div>

      {unassigned.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">
              Sin asignar
              {critical > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                  {critical} crítico{critical > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <Link to="/technician/tickets" className="text-sm text-cyan-400 hover:text-cyan-300">
              Ver todos →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {unassigned.slice(0, 4).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} basePath="/technician/tickets" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-white">Mis tickets recientes</h2>
        <div className="mt-4 space-y-3">
          {assigned.length === 0 && unassigned.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-slate-400">No hay tickets por atender.</p>
            </div>
          )}
          {assigned.slice(0, 5).map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} basePath="/technician/tickets" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
