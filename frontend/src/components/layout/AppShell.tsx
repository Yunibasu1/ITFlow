import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../services/auth'
import { dedupeCategories } from '../../services/categories'
import { NotificationsBell } from './NotificationsBell'
import type { Role } from '../../types/User'
import {
  DashboardIcon,
  TicketIcon,
  PlusIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  UsersIcon,
} from '../ui/icons'

const ROLE_LABELS: Record<Role, string> = {
  user: 'Usuario',
  technician: 'Técnico',
  admin: 'Administrador',
}

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

function navForRole(role: Role): NavItem[] {
  const common = [
    { to: `/${role}`, label: 'Panel', icon: <DashboardIcon />, end: true },
    { to: `/${role}/tickets`, label: 'Tickets', icon: <TicketIcon /> },
  ]
  if (role === 'user') {
    common.push({ to: '/user/tickets/new', label: 'Nueva incidencia', icon: <PlusIcon /> })
  }
  if (role === 'admin') {
    common.push({ to: '/admin/users', label: 'Usuarios', icon: <UsersIcon /> })
  }
  return common
}

export function AppShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (profile?.role === 'admin') {
      dedupeCategories().catch(() => {})
    }
  }, [profile?.role])

  if (!profile) return null
  const nav = navForRole(profile.role)
  const fullName = `${profile.name} ${profile.lastname}`.trim()

  async function handleLogout() {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-9 w-9 items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-sm" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 font-display text-sm font-extrabold text-slate-950">
            IT
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-white">ITFlow</p>
          <p className="text-[11px] text-slate-500">Soporte técnico</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 text-sm font-bold text-cyan-300">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{fullName}</p>
            <p className="text-[11px] text-slate-500">{ROLE_LABELS[profile.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogoutIcon />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-svh bg-slate-950">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-slate-950/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Sidebar móvil */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-950 lg:hidden"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="flex min-h-svh w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
          <h1 className="font-display text-lg font-bold tracking-tight text-white">
            {title}
          </h1>
          <div className="ml-auto">
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
