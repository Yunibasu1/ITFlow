import { AlertIcon } from '../ui/icons'
import { SLA_LEVEL_LABELS, SLA_LEVEL_STYLES, getSlaStatus } from '../../utils/sla'
import type { Ticket } from '../../types/Ticket'

export function SlaBadge({ ticket }: { ticket: Ticket }) {
  const sla = getSlaStatus(ticket)
  if (!sla || sla.level === 'ok') return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${SLA_LEVEL_STYLES[sla.level]}`}
    >
      <AlertIcon width={12} height={12} />
      {SLA_LEVEL_LABELS[sla.level]}
    </span>
  )
}
