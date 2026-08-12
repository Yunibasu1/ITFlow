export function formatDate(value: Date | null | undefined): string {
  if (!value) return '—'
  return value.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: Date | null | undefined): string {
  if (!value) return '—'
  return value.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(value: Date | null | undefined): string {
  if (!value) return '—'
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000)
  if (seconds < 60) return 'ahora mismo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return formatDate(value)
}

export function formatHours(hours: number): string {
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours % 24)
  return rest > 0 ? `${days} d ${rest} h` : `${days} d`
}
