import { useEffect, useRef, useState, type ButtonHTMLAttributes, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTicket } from '../../hooks/useTicket'
import {
  changeStatus,
  assignTicket,
  addComment,
} from '../../services/tickets'
import { notifyUser } from '../../services/notifications'
import { getUserProfile, listUsersByRole } from '../../services/users'
import {
  getEvaluationForTicket,
  createEvaluation,
} from '../../services/evaluations'
import type { User } from '../../types/User'
import type { Comment } from '../../types/Comment'
import { PRIORITY_LABELS } from '../../types/Ticket'
import { CheckIcon, SendIcon, StarIcon, AlertIcon } from '../ui/icons'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { formatDateTime, formatHours, timeAgo } from '../../utils/format'
import {
  getSlaStatus,
  formatTimeRemaining,
  SLA_LEVEL_TEXTS,
  SLA_LEVEL_STYLES,
  type SlaLevel,
} from '../../utils/sla'

const DEADLINE_TEXT_COLORS: Record<SlaLevel, string> = {
  ok: 'text-slate-300',
  warning: 'text-amber-300',
  critical: 'text-red-300',
}

function ActionButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:from-cyan-500/30 hover:to-indigo-500/30 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { profile, currentUser } = useAuth()
  const { ticket, comments, loading, notFound, error } = useTicket(ticketId)

  const [owner, setOwner] = useState<User | null>(null)
  const [assignee, setAssignee] = useState<User | null>(null)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [sending, setSending] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [reassignId, setReassignId] = useState('')
  const [actionError, setActionError] = useState('')

  const [evaluation, setEvaluation] = useState<{
    rating: number
    comment: string
  } | null>(null)
  const [existingEvaluation, setExistingEvaluation] = useState(false)
  const [evaluationBusy, setEvaluationBusy] = useState(false)
  const [evaluationError, setEvaluationError] = useState('')
  const submittedTicketRef = useRef<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!ticket) return
    getUserProfile(ticket.userId).then(setOwner).catch(() => {})
    if (ticket.assignedTo) {
      getUserProfile(ticket.assignedTo).then(setAssignee).catch(() => {})
    } else {
      setAssignee(null)
    }
  }, [ticket])

  useEffect(() => {
    if (profile?.role !== 'admin') return
    listUsersByRole('technician').then(setTechnicians).catch(() => {})
  }, [profile?.role])

  useEffect(() => {
    if (!ticket || !currentUser) return
    if (ticket.status !== 'closed' || ticket.userId !== currentUser.uid) return
    getEvaluationForTicket(ticket.id)
      .then((ev) => {
        if (submittedTicketRef.current === ticket.id) return
        setExistingEvaluation(ev !== null)
      })
      .catch(() => {})
  }, [ticket, currentUser])

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Cargando ticket…</div>
  }

  if (notFound || !ticket) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-400">El ticket no existe o no tienes acceso.</p>
      </div>
    )
  }

  if (error) {
    return <div className="py-16 text-center text-red-400">{error}</div>
  }

  const ticketData = ticket
  const slaStatus = getSlaStatus(ticket, now)
  const isOwner = currentUser?.uid === ticketData.userId
  const isAssigned = currentUser?.uid === ticket.assignedTo
  const isStaff = profile?.role === 'technician' || profile?.role === 'admin'
  const canAct = isAssigned || profile?.role === 'admin'
  const canComment = isOwner || isAssigned || profile?.role === 'admin'
  const displayName = (u: User | null) =>
    u ? `${u.name} ${u.lastname}`.trim() || u.email : '—'
  const categoryLabel = ticket.category
    ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)
    : '—'

  const canAccept = profile?.role === 'technician' && !ticket.assignedTo
  const showStart = canAct && ticket.status === 'assigned'
  const showProgress = canAct && ticket.status === 'in_progress'
  const showWaiting = canAct && ticket.status === 'waiting_user'
  const showReopen =
    (canAct || isOwner) &&
    (ticket.status === 'resolved' || ticket.status === 'reopened')
  const hasActions =
    canAccept || showStart || showProgress || showWaiting || showReopen ||
    profile?.role === 'admin'

  async function runAction(fn: () => Promise<void>) {
    setActionBusy(true)
    setActionError('')
    try {
      await fn()
    } catch (err) {
      console.error('Error en acción:', err)
      setActionError('No se pudo realizar la acción. Inténtalo de nuevo.')
    } finally {
      setActionBusy(false)
    }
  }

  function notifyOwner(title: string) {
    notifyUser(ticketData.userId, {
      title,
      body: `${ticketData.ticketNumber} · ${ticketData.title}`,
      type: 'status',
      ticketId: ticketData.id,
      link: `/user/tickets/${ticketData.id}`,
    }).catch(() => {})
  }

  function notifyAssignee(title: string) {
    if (!ticketData.assignedTo) return
    notifyUser(ticketData.assignedTo, {
      title,
      body: `${ticketData.ticketNumber} · ${ticketData.title}`,
      type: 'status',
      ticketId: ticketData.id,
      link: `/technician/tickets/${ticketData.id}`,
    }).catch(() => {})
  }

  async function handleSendComment(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !commentBody.trim()) return
    setSending(true)
    try {
      await addComment(ticketData.id, currentUser.uid, commentBody.trim())
      const recipient = isOwner ? ticketData.assignedTo : ticketData.userId
      if (recipient) {
        notifyUser(recipient, {
          title: 'Nuevo comentario',
          body: `${ticketData.ticketNumber} · ${ticketData.title}`,
          type: 'comment',
          ticketId: ticketData.id,
          link:
            recipient === ticketData.userId
              ? `/user/tickets/${ticketData.id}`
              : `/technician/tickets/${ticketData.id}`,
        }).catch(() => {})
      }
      setCommentBody('')
    } catch (err) {
      console.error('Error comentando:', err)
      setActionError('No se pudo enviar el comentario.')
    } finally {
      setSending(false)
    }
  }

  async function handleReassign() {
    if (!reassignId) return
    await runAction(async () => {
      await assignTicket(ticketData.id, reassignId)
      setReassignId('')
    })
  }

  async function handleEvaluate(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !evaluation || evaluation.rating === 0) return
    setEvaluationBusy(true)
    setEvaluationError('')
    try {
      await createEvaluation({
        ticketId: ticketData.id,
        userId: currentUser.uid,
        rating: evaluation.rating,
        comment: evaluation.comment,
      })
      submittedTicketRef.current = ticketData.id
      setExistingEvaluation(true)
    } catch (err) {
      console.error('Error evaluando:', err)
      setEvaluationError('No se pudo guardar la evaluación. Inténtalo de nuevo.')
    } finally {
      setEvaluationBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Cabecera */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-cyan-400">
            {ticket.ticketNumber}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>

        <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-white">
          {ticket.title}
        </h2>

        {slaStatus && slaStatus.level !== 'ok' && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${SLA_LEVEL_STYLES[slaStatus.level]}`}
          >
            <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                {slaStatus.level === 'critical'
                  ? 'SLA vencido'
                  : 'SLA por vencer'}
              </p>
              <p className="mt-0.5 opacity-90">
                Límite de {slaStatus.activeDeadline === 'response' ? 'respuesta' : 'resolución'}:{' '}
                <span className="font-medium">
                  {formatTimeRemaining(
                    slaStatus.activeDeadline === 'response'
                      ? slaStatus.responseMs
                      : slaStatus.resolutionMs,
                  )}
                </span>{' '}
                ({formatDateTime(
                  slaStatus.activeDeadline === 'response'
                    ? ticket.sla!.responseDeadline
                    : ticket.sla!.resolutionDeadline,
                )})
              </p>
            </div>
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Usuario</dt>
            <dd className="mt-0.5 font-medium text-white">{displayName(owner)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Técnico</dt>
            <dd className="mt-0.5 font-medium text-white">{displayName(assignee)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Categoría</dt>
            <dd className="mt-0.5 font-medium capitalize text-white">
              {categoryLabel}
              {ticket.subcategory ? ` · ${ticket.subcategory}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Creado</dt>
            <dd className="mt-0.5 text-slate-300">{formatDateTime(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Actualizado</dt>
            <dd className="mt-0.5 text-slate-300">{timeAgo(ticket.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Departamento</dt>
            <dd className="mt-0.5 text-slate-300">
              {ticket.department || '—'}
            </dd>
          </div>
        </dl>

        {ticket.sla && (
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SLA
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Respuesta</p>
                <p className="font-medium text-slate-200">
                  {formatHours(ticket.sla.responseHours)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Resolución</p>
                <p className="font-medium text-slate-200">
                  {formatHours(ticket.sla.resolutionHours)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Límite resp.</p>
                <p className={DEADLINE_TEXT_COLORS[slaStatus?.responseLevel ?? 'ok']}>
                  {formatDateTime(ticket.sla.responseDeadline)}
                </p>
                {slaStatus && slaStatus.responseLevel !== 'ok' && (
                  <p className="mt-0.5 text-xs opacity-80">
                    {SLA_LEVEL_TEXTS[slaStatus.responseLevel]}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500">Límite res.</p>
                <p className={DEADLINE_TEXT_COLORS[slaStatus?.resolutionLevel ?? 'ok']}>
                  {formatDateTime(ticket.sla.resolutionDeadline)}
                </p>
                {slaStatus && slaStatus.resolutionLevel !== 'ok' && (
                  <p className="mt-0.5 text-xs opacity-80">
                    {SLA_LEVEL_TEXTS[slaStatus.resolutionLevel]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Descripción
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {ticket.description}
          </p>
        </div>

        {ticket.aiAnalysis && (
          <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                🤖 Análisis de IA
              </p>
              <span className="text-xs text-slate-500">
                {ticket.aiAnalysis.model}
                {ticket.aiAnalysis.analyzedAt && (
                  <> · {timeAgo(ticket.aiAnalysis.analyzedAt)}</>
                )}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Categoría</p>
                <p className="mt-0.5 font-medium capitalize text-white">
                  {ticket.aiAnalysis.category || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Subcategoría</p>
                <p className="mt-0.5 font-medium capitalize text-white">
                  {ticket.aiAnalysis.subcategory || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Prioridad sugerida</p>
                <p className="mt-0.5 font-medium text-white">
                  {ticket.aiAnalysis.priority
                    ? PRIORITY_LABELS[ticket.aiAnalysis.priority]
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tipo de problema</p>
                <p className="mt-0.5 font-medium capitalize text-white">
                  {ticket.aiAnalysis.problem_type || '—'}
                </p>
              </div>
            </div>

            {ticket.aiAnalysis.summary && (
              <div className="mt-3">
                <p className="text-xs text-slate-500">Resumen</p>
                <p className="mt-0.5 text-sm text-slate-300">
                  {ticket.aiAnalysis.summary}
                </p>
              </div>
            )}

            {ticket.aiAnalysis.suggested_solution && (
              <div className="mt-3">
                <p className="text-xs text-slate-500">Solución sugerida</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">
                  {ticket.aiAnalysis.suggested_solution}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      {isStaff && hasActions && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Acciones
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {canAccept && (
              <ActionButton
                disabled={actionBusy}
                onClick={() =>
                  runAction(async () => {
                    await assignTicket(ticket.id, currentUser!.uid)
                    notifyOwner('Ticket aceptado')
                  })
                }
              >
                Aceptar ticket
              </ActionButton>
            )}

            {showStart && (
              <ActionButton
                disabled={actionBusy}
                onClick={() =>
                  runAction(async () => {
                    await changeStatus(ticket.id, 'in_progress')
                    notifyOwner('Ticket en progreso')
                  })
                }
              >
                Iniciar trabajo
              </ActionButton>
            )}

            {showProgress && (
              <>
                <ActionButton
                  disabled={actionBusy}
                  onClick={() =>
                    runAction(async () => {
                      await changeStatus(ticket.id, 'waiting_user')
                      notifyOwner('Esperando tu respuesta')
                    })
                  }
                >
                  Esperando usuario
                </ActionButton>
                <ActionButton
                  disabled={actionBusy}
                  onClick={() =>
                    runAction(async () => {
                      await changeStatus(ticket.id, 'resolved')
                      notifyOwner('Ticket resuelto')
                    })
                  }
                >
                  <CheckIcon /> Marcar resuelto
                </ActionButton>
              </>
            )}

            {showWaiting && (
              <ActionButton
                disabled={actionBusy}
                onClick={() =>
                  runAction(async () => {
                    await changeStatus(ticket.id, 'in_progress')
                    notifyOwner('Ticket en progreso')
                  })
                }
              >
                Reanudar trabajo
              </ActionButton>
            )}

            {showReopen && (
              <ActionButton
                disabled={actionBusy}
                onClick={() =>
                  runAction(async () => {
                    await changeStatus(ticket.id, 'in_progress')
                    notifyAssignee('Ticket reabierto')
                  })
                }
              >
                Reabrir / Retomar
              </ActionButton>
            )}

            {profile?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <select
                  value={reassignId}
                  onChange={(e) => setReassignId(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="">Reasignar a técnico…</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {`${t.name} ${t.lastname}`.trim() || t.email}
                    </option>
                  ))}
                </select>
                <ActionButton disabled={!reassignId || actionBusy} onClick={handleReassign}>
                  Asignar
                </ActionButton>
              </div>
            )}
          </div>

          {actionError && <p className="mt-3 text-sm text-red-400">{actionError}</p>}
        </div>
      )}

      {/* Confirmación del usuario */}
      {isOwner && ticket.status === 'resolved' && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <p className="font-semibold text-white">¿El problema fue solucionado?</p>
          <p className="mt-1 text-sm text-slate-400">
            Confirma para cerrar la incidencia o indícanos que sigue el problema.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton
              disabled={actionBusy}
              onClick={() =>
                runAction(async () => {
                  await changeStatus(ticket.id, 'closed')
                  notifyAssignee('Ticket cerrado por el usuario')
                })
              }
            >
              <CheckIcon /> Sí, solucionado
            </ActionButton>
            <ActionButton
              disabled={actionBusy}
              onClick={() =>
                runAction(async () => {
                  await changeStatus(ticket.id, 'reopened')
                  notifyAssignee('El usuario indica que sigue el problema')
                })
              }
            >
              No, sigue el problema
            </ActionButton>
          </div>
        </div>
      )}

      {/* Evaluación */}
      {isOwner && ticket.status === 'closed' && !existingEvaluation && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="font-semibold text-white">¿Cómo fue la atención?</p>
          <form onSubmit={handleEvaluate} className="mt-3 space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEvaluation({ rating: n, comment: evaluation?.comment ?? '' })}
                  className={`transition-transform hover:scale-110 ${
                    (evaluation?.rating ?? 0) >= n ? 'text-yellow-400' : 'text-slate-700'
                  }`}
                  aria-label={`${n} estrellas`}
                >
                  <StarIcon width={26} height={26} />
                </button>
              ))}
            </div>
            <textarea
              value={evaluation?.comment ?? ''}
              onChange={(e) =>
                setEvaluation({ rating: evaluation?.rating ?? 0, comment: e.target.value })
              }
              placeholder="Cuéntanos tu experiencia (opcional)"
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
            />
            <ActionButton type="submit" disabled={!evaluation?.rating || evaluationBusy}>
              Enviar evaluación
            </ActionButton>
            {evaluationError && (
              <p className="text-sm text-red-400">{evaluationError}</p>
            )}
          </form>
        </div>
      )}

      {/* Comentarios */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Historial ({comments.length})
        </p>

        <div className="mt-4 space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-slate-500">
              Sin comentarios todavía. El técnico verá este ticket.
            </p>
          )}
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>

        {canComment && (
          <form onSubmit={handleSendComment} className="mt-4 flex items-start gap-2">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={2}
              placeholder="Escribe un comentario…"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={sending || !commentBody.trim()}
              className="itflow-btn-sheen relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function CommentRow({ comment }: { comment: Comment }) {
  const [author, setAuthor] = useState<User | null>(null)

  useEffect(() => {
    getUserProfile(comment.userId).then(setAuthor).catch(() => {})
  }, [comment.userId])

  const authorName = author
    ? `${author.name} ${author.lastname}`.trim() || author.email
    : 'Usuario'

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 text-xs font-bold text-cyan-300">
        {authorName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-white">{authorName}</p>
          <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{comment.body}</p>
      </div>
    </div>
  )
}
