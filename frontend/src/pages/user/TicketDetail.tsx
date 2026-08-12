import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { TicketDetailView } from '../../components/tickets/TicketDetailView'
import { ChevronRightIcon } from '../../components/ui/icons'

export function UserTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>()
  if (!ticketId) return null

  return (
    <AppShell title="Detalle de incidencia">
      <Link
        to="/user/tickets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-cyan-400"
      >
        <ChevronRightIcon className="rotate-180" />
        Volver a mis incidencias
      </Link>
      <TicketDetailView ticketId={ticketId} />
    </AppShell>
  )
}
