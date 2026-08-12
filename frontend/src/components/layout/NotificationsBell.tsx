import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import {
  subscribeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from '../../services/notifications'
import { timeAgo } from '../../utils/format'
import { BellIcon, TicketIcon, CommentIcon } from '../ui/icons'

const TYPE_LABEL: Record<string, string> = {
  ticket: 'Ticket',
  comment: 'Comentario',
  status: 'Estado',
  assign: 'Asignación',
  system: 'Sistema',
}

export function NotificationsBell() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentUser) return
    return subscribeNotifications(currentUser.uid, setItems)
  }, [currentUser])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const unread = items.filter((n) => !n.read).length

  function handleOpen() {
    setOpen((v) => !v)
  }

  function handleClick(item: AppNotification) {
    setOpen(false)
    if (!item.read) {
      markNotificationRead(item.id).catch(() => {})
    }
    if (item.link) navigate(item.link)
  }

  function handleMarkAll() {
    const ids = items.filter((n) => !n.read).map((n) => n.id)
    if (ids.length > 0) {
      markAllNotificationsRead(ids).catch(() => {})
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        className="relative rounded-xl border border-white/10 bg-slate-900/60 p-2.5 text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <p className="text-sm font-semibold text-white">Notificaciones</p>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No tienes notificaciones.
                </div>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    item.read ? 'opacity-60' : ''
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.read
                        ? 'bg-white/5 text-slate-500'
                        : 'bg-cyan-500/15 text-cyan-300'
                    }`}
                  >
                    {item.type === 'comment' ? (
                      <CommentIcon width={16} height={16} />
                    ) : (
                      <TicketIcon width={16} height={16} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {item.body}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-600">
                      {timeAgo(item.createdAt)} · {TYPE_LABEL[item.type]}
                    </span>
                  </span>
                  {!item.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
