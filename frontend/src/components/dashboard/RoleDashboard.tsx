interface RoleDashboardProps {
  title: string
  description: string
}

export function RoleDashboard({ title, description }: RoleDashboardProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">{title}</h1>
        <p className="text-slate-400">{description}</p>
        <p className="mt-6 inline-block rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400">
          🚧 En construcción — Fase 2: Tickets
        </p>
      </div>
    </div>
  )
}
