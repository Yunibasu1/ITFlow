import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loadCategories } from '../../services/categories'
import { createTicket } from '../../services/tickets'
import { triggerTicketAnalysis } from '../../services/n8n'
import { notifyRole } from '../../services/notifications'
import { AppShell } from '../../components/layout/AppShell'
import type { Category } from '../../types/Category'
import type { Priority } from '../../types/Ticket'
import { PRIORITY_LABELS } from '../../types/Ticket'
import { SendIcon, WrenchIcon, CheckIcon } from '../../components/ui/icons'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400'

const PRIORITY_SLA: Record<Priority, { response: string; resolution: string; dot: string }> = {
  critical: { response: '1 h', resolution: '4 h', dot: 'bg-red-400' },
  high: { response: '2 h', resolution: '8 h', dot: 'bg-orange-400' },
  medium: { response: '4 h', resolution: '24 h', dot: 'bg-yellow-400' },
  low: { response: '8 h', resolution: '48 h', dot: 'bg-emerald-400' },
}

const PRIORITY_SELECTED: Record<Priority, string> = {
  critical: 'border-red-400/60 bg-red-500/15',
  high: 'border-orange-400/60 bg-orange-500/15',
  medium: 'border-yellow-400/60 bg-yellow-500/15',
  low: 'border-emerald-400/60 bg-emerald-500/15',
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-11 rounded-xl bg-white/5" />
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-28 rounded-xl bg-white/5" />
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-11 rounded-xl bg-white/5" />
    </div>
  )
}

export function CreateTicket() {
  const navigate = useNavigate()
  const { currentUser, profile } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [catsLoading, setCatsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryKey, setCategoryKey] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    loadCategories()
      .then((cats) => {
        if (!active) return
        setCategories(cats)
        if (cats.length > 0) setCategoryKey(cats[0].key)
        else setError('Aún no hay categorías configuradas.')
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las categorías.')
      })
      .finally(() => {
        if (active) setCatsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const currentCategory = categories.find((c) => c.key === categoryKey)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !categoryKey) return
    setSubmitting(true)
    setError('')
    try {
      const { id, ticketNumber } = await createTicket({
        userId: currentUser.uid,
        department: profile?.department ?? '',
        title: title.trim(),
        description: description.trim(),
        category: categoryKey,
        subcategory,
        priority,
      })
      notifyRole(['technician', 'admin'], (role) => ({
        title: 'Nuevo ticket',
        body: `${ticketNumber} · ${title.trim()}`,
        type: 'ticket',
        ticketId: id,
        link: `/${role}/tickets/${id}`,
      })).catch(() => {})

      triggerTicketAnalysis({
        ticketId: id,
        ticketNumber,
        title: title.trim(),
        description: description.trim(),
        category: categoryKey,
        subcategory,
        priority,
        department: profile?.department ?? '',
        userName: `${profile?.name ?? ''} ${profile?.lastname ?? ''}`.trim(),
        userEmail: profile?.email ?? currentUser.email ?? '',
        createdAt: new Date().toISOString(),
      }).catch(() => {})

      navigate(`/user/tickets/${id}`, { replace: true })
    } catch (err) {
      console.error('Error creando ticket:', err)
      setError('No se pudo crear la incidencia. Revisa las reglas de Firestore.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title="Nueva incidencia">
      <div className="relative mx-auto max-w-2xl">
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-indigo-500/20" />

        <form
          onSubmit={handleSubmit}
          className="relative space-y-6 rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 text-cyan-300">
              <WrenchIcon />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Reporta una incidencia</h2>
              <p className="text-sm text-slate-500">
                Cuantos más detalles des, más rápido se resuelve.
              </p>
            </div>
          </div>

          {catsLoading ? (
            <Skeleton />
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="title">
                    Título
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="Ej.: No puedo imprimir desde mi laptop"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                    htmlFor="description"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    placeholder="Explica el problema con detalle: desde cuándo ocurre, qué intentaste, qué mensajes ves…"
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Categoría</p>
                {categories.length === 0 ? (
                  <p className="text-sm text-amber-300">
                    {error || 'Aún no hay categorías configuradas.'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setCategoryKey(c.key)
                          setSubcategory('')
                        }}
                        className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                          categoryKey === c.key
                            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentCategory && currentCategory.subcategories.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Subcategoría</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSubcategory('')}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        subcategory === ''
                          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                          : 'border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      General
                    </button>
                    {currentCategory.subcategories.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSubcategory(s.key)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          subcategory === s.key
                            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Prioridad</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`relative rounded-xl border p-3 text-left transition-all ${
                        priority === p
                          ? PRIORITY_SELECTED[p]
                          : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      {priority === p && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white">
                          <CheckIcon width={12} height={12} />
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_SLA[p].dot}`} />
                        <span className="text-sm font-semibold text-white">{PRIORITY_LABELS[p]}</span>
                      </span>
                      <span className="mt-1.5 block text-[11px] text-slate-500">
                        {PRIORITY_SLA[p].response} resp. · {PRIORITY_SLA[p].resolution} sol.
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting || categories.length === 0}
                className="itflow-btn-sheen relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendIcon width={16} height={16} />
                {submitting ? 'Creando incidencia…' : 'Enviar incidencia'}
              </button>
            </>
          )}
        </form>
      </div>
    </AppShell>
  )
}
