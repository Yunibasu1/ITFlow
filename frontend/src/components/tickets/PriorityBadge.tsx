import type { Priority } from '../../types/Ticket'
import { PRIORITY_LABELS } from '../../types/Ticket'
import { PRIORITY_COLORS, PRIORITY_DOTS } from '../../utils/ticket'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOTS[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
