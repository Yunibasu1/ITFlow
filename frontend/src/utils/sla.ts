import type { Ticket } from '../types/Ticket'

export type SlaLevel = 'ok' | 'warning' | 'critical'

export interface SlaStatus {
  level: SlaLevel
  responseLevel: SlaLevel
  resolutionLevel: SlaLevel
  responseMs: number
  resolutionMs: number
  activeDeadline: 'response' | 'resolution'
  unassigned: boolean
}

const OPEN_STATUSES: Ticket['status'][] = [
  'new',
  'pending',
  'assigned',
  'in_progress',
  'waiting_user',
  'reopened',
  'escalated',
]

export function isOpenTicket(ticket: Ticket): boolean {
  return OPEN_STATUSES.includes(ticket.status)
}

function levelFor(remainingMs: number, totalMs: number): SlaLevel {
  if (remainingMs < 0) return 'critical'
  if (totalMs > 0 && remainingMs <= totalMs * 0.2) return 'warning'
  return 'ok'
}

export function getSlaStatus(ticket: Ticket, now = new Date()): SlaStatus | null {
  if (!ticket.sla || !isOpenTicket(ticket)) return null

  const sla = ticket.sla
  const responseMs = sla.responseDeadline.getTime() - now.getTime()
  const resolutionMs = sla.resolutionDeadline.getTime() - now.getTime()
  const responseTotal = sla.responseHours * 3_600_000
  const resolutionTotal = sla.resolutionHours * 3_600_000

  const unassigned = !ticket.assignedTo
  const activeDeadline: 'response' | 'resolution' = unassigned ? 'response' : 'resolution'
  const activeRemaining = unassigned ? responseMs : resolutionMs
  const activeTotal = unassigned ? responseTotal : resolutionTotal

  return {
    level: levelFor(activeRemaining, activeTotal),
    responseLevel: levelFor(responseMs, responseTotal),
    resolutionLevel: levelFor(resolutionMs, resolutionTotal),
    responseMs,
    resolutionMs,
    activeDeadline,
    unassigned,
  }
}

export const SLA_LEVEL_LABELS: Record<SlaLevel, string> = {
  ok: 'SLA OK',
  warning: 'SLA por vencer',
  critical: 'SLA vencido',
}

export const SLA_LEVEL_TEXTS: Record<SlaLevel, string> = {
  ok: 'Dentro del SLA',
  warning: 'Por vencer',
  critical: 'Vencido',
}

export function formatTimeRemaining(ms: number): string {
  const sign = ms < 0 ? 'hace ' : 'quedan '
  const abs = Math.abs(ms)
  const minutes = Math.round(abs / 60_000)
  if (minutes < 60) return `${sign}${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${sign}${hours} h`
  const days = Math.floor(hours / 24)
  const rest = hours % 24
  return rest > 0 ? `${sign}${days} d ${rest} h` : `${sign}${days} d`
}

export const SLA_LEVEL_STYLES: Record<SlaLevel, string> = {
  ok: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
  critical: 'border-red-400/30 bg-red-500/10 text-red-300',
}
