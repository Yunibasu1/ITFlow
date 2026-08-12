export type NotificationType =
  | 'ticket_created'
  | 'ticket_analyzed'
  | 'ticket_assigned'
  | 'ticket_updated'
  | 'ticket_resolved'
  | 'ticket_closed'
  | 'ticket_reopened'
  | 'sla_warning'
  | 'sla_violated'
  | 'evaluation_request'

export interface Notification {
  id: string
  userId: string
  ticketId: string | null
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: Date
}
