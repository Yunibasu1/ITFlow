export type TicketStatus =
  | 'new'
  | 'analyzing'
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'waiting_user'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'escalated'
  | 'cancelled'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface AiAnalysis {
  category: string
  subcategory: string
  priority: Priority
  summary: string
  problem_type: string
  suggested_solution: string
  model: string
  analyzedAt: Date
}

export interface SlaInfo {
  responseHours: number
  resolutionHours: number
  responseDeadline: Date
  resolutionDeadline: Date
  responseMet: boolean | null
  resolutionMet: boolean | null
  violated: boolean
}

export interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  category: string
  subcategory: string
  priority: Priority
  status: TicketStatus
  userId: string
  assignedTo: string | null
  department: string
  aiAnalysis: AiAnalysis | null
  sla: SlaInfo | null
  createdAt: Date
  updatedAt: Date
  assignedAt: Date | null
  resolvedAt: Date | null
  closedAt: Date | null
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Nuevo',
  analyzing: 'Analizando',
  pending: 'Pendiente',
  assigned: 'Asignado',
  in_progress: 'En progreso',
  waiting_user: 'Esperando usuario',
  resolved: 'Resuelto',
  reopened: 'Reabierto',
  closed: 'Cerrado',
  escalated: 'Escalado',
  cancelled: 'Cancelado',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}
