import type { TicketStatus } from '../../types/Ticket'
import { TICKET_STATUS_LABELS } from '../../types/Ticket'
import { STATUS_COLORS, STATUS_EMOJIS } from '../../utils/ticket'

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}
    >
      <span aria-hidden="true">{STATUS_EMOJIS[status]}</span>
      {TICKET_STATUS_LABELS[status]}
    </span>
  )
}
