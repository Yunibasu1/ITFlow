import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeAllUsers, updateUserRole } from '../../services/users'
import { AppShell } from '../../components/layout/AppShell'
import { StatCard } from '../../components/dashboard/StatCard'
import { SearchIcon, UsersIcon, WrenchIcon, ShieldIcon } from '../../components/ui/icons'
import type { Role, User } from '../../types/User'

const ROLE_LABELS: Record<Role, string> = {
  user: 'Usuario',
  technician: 'Técnico',
  admin: 'Administrador',
}

const ROLE_COLORS: Record<Role, string> = {
  user: 'border-white/10 bg-white/5 text-slate-400',
  technician: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
  admin: 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300',
}

export function AdminUsers() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => subscribeAllUsers(setUsers), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      `${u.name} ${u.lastname} ${u.email}`.toLowerCase().includes(q),
    )
  }, [users, search])

  const totals = useMemo(
    () => ({
      total: users.length,
      technicians: users.filter((u) => u.role === 'technician').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }),
    [users],
  )

  async function handleRoleChange(user: User, role: Role) {
    if (user.id === currentUser?.uid) return
    if (role === user.role) return
    const fullName = `${user.name} ${user.lastname}`.trim() || user.email
    if (
      !window.confirm(
        `¿Cambiar el rol de ${fullName} a "${ROLE_LABELS[role]}"?`,
      )
    )
      return
    setBusyId(user.id)
    setError('')
    setSaved('')
    try {
      await updateUserRole(user.id, role)
      setSaved(
        `Rol de ${fullName} actualizado a ${ROLE_LABELS[role]}.`,
      )
    } catch (err) {
      console.error('Error actualizando rol:', err)
      setError('No se pudo actualizar el rol. Inténtalo de nuevo.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <AppShell title="Usuarios">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={totals.total} accent="cyan" icon={<UsersIcon />} />
        <StatCard label="Técnicos" value={totals.technicians} accent="indigo" icon={<WrenchIcon />} />
        <StatCard label="Administradores" value={totals.admins} accent="amber" icon={<ShieldIcon />} />
      </div>

      <div className="mt-6">
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {saved && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
          {saved}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No hay usuarios que coincidan.
          </div>
        )}
        <ul className="divide-y divide-white/5">
          {filtered.map((user) => {
            const isSelf = user.id === currentUser?.uid
            const fullName =
              `${user.name} ${user.lastname}`.trim() || user.email
            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 text-sm font-bold text-cyan-300">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {fullName}
                      {isSelf && (
                        <span className="ml-2 text-xs text-slate-500">(tú)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                  <select
                    value={user.role}
                    disabled={busyId === user.id || isSelf}
                    onChange={(e) =>
                      handleRoleChange(user, e.target.value as Role)
                    }
                    title={
                      isSelf
                        ? 'No puedes cambiar tu propio rol'
                        : 'Cambiar rol'
                    }
                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="user">Usuario</option>
                    <option value="technician">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <UsersIcon width={16} height={16} />
        No puedes cambiar tu propio rol desde aquí para evitar bloquearte.
      </p>
    </AppShell>
  )
}
