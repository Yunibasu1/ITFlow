import type {
  Priority,
  TicketStatus,
} from '../types/Ticket'

export const STATUS_EMOJIS: Record<TicketStatus, string> = {
  new: '🆕',
  analyzing: '🤖',
  pending: '⏳',
  assigned: '👨‍💻',
  in_progress: '🔧',
  waiting_user: '💬',
  resolved: '✅',
  reopened: '🔄',
  closed: '🔒',
  escalated: '🚨',
  cancelled: '❌',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
}

export const PRIORITY_DOTS: Record<Priority, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-yellow-400',
  high: 'bg-orange-400',
  critical: 'bg-red-400',
}

export const STATUS_COLORS: Record<TicketStatus, string> = {
  new: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  analyzing: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  pending: 'text-slate-300 bg-slate-400/10 border-slate-400/30',
  assigned: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
  in_progress: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  waiting_user: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30',
  resolved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  reopened: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  closed: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  escalated: 'text-red-400 bg-red-400/10 border-red-400/30',
  cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
}

export const STATUS_BAR_COLORS: Record<TicketStatus, string> = {
  new: 'bg-cyan-400',
  analyzing: 'bg-violet-400',
  pending: 'bg-slate-400',
  assigned: 'bg-sky-400',
  in_progress: 'bg-indigo-400',
  waiting_user: 'bg-fuchsia-400',
  reopened: 'bg-amber-400',
  escalated: 'bg-red-400',
  resolved: 'bg-emerald-400',
  closed: 'bg-slate-500',
  cancelled: 'bg-slate-600',
}

export const OPEN_STATUSES: TicketStatus[] = [
  'new',
  'analyzing',
  'pending',
  'assigned',
  'in_progress',
  'waiting_user',
  'reopened',
  'escalated',
]

export const CLOSED_STATUSES: TicketStatus[] = ['resolved', 'closed', 'cancelled']
