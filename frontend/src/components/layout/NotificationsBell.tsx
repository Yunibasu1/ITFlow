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
import {
  playNotificationSound,
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from '../../utils/notificationSound'
import {
  BellIcon,
  TicketIcon,
  CommentIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '../ui/icons'

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
  const [soundOn, setSoundOn] = useState(isNotificationSoundEnabled())
  const boxRef = useRef<HTMLDivElement>(null)
  const knownIdsRef = useRef<Set<string>>(new Set())
  const baselineRef = useRef(true)

  useEffect(() => {
    if (!currentUser) return
    baselineRef.current = true
    knownIdsRef.current = new Set()
    return subscribeNotifications(currentUser.uid, (list) => {
      const known = knownIdsRef.current
      const freshUnread = baselineRef.current
        ? []
        : list.filter((n) => !n.read && !known.has(n.id))
      baselineRef.current = false
      list.forEach((n) => known.add(n.id))
      setItems(list)
      if (freshUnread.length > 0) playNotificationSound()
    })
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

  function handleToggleSound() {
    setSoundOn((v) => {
      setNotificationSoundEnabled(!v)
      return !v
    })
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
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 px-1 text-[10px] font-bold text-slate-950 shadow-md shadow-cyan-500/40"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <BellIcon width={16} height={16} className="text-cyan-400" />
                Notificaciones
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleSound}
                  title={soundOn ? 'Desactivar sonido' : 'Activar sonido'}
                  aria-label={soundOn ? 'Desactivar sonido' : 'Activar sonido'}
                  className={`text-slate-400 transition-colors hover:text-cyan-300 ${
                    soundOn ? '' : 'opacity-50'
                  }`}
                >
                  {soundOn ? (
                    <VolumeIcon width={16} height={16} />
                  ) : (
                    <VolumeOffIcon width={16} height={16} />
                  )}
                </button>
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    Marcar todas
                  </button>
                )}
              </div>
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
                  className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    item.read
                      ? 'border-transparent opacity-60'
                      : 'border-cyan-400/60 bg-cyan-500/[0.03]'
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
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
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
