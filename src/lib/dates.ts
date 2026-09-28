import type { Todo } from './types'

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateInputValue(v: string): Date | null {
  if (!v) return null
  const [y, m, d] = v.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function dueInfo(due: Todo['due']): { label: string; overdue: boolean } | null {
  if (!due) return null
  const date = due.toDate()
  const today = startOfToday()
  const diffDays = Math.round(
    (new Date(date).setHours(0, 0, 0, 0) - today.getTime()) / 86_400_000,
  )
  if (diffDays === 0) return { label: 'Today', overdue: false }
  if (diffDays === 1) return { label: 'Tomorrow', overdue: false }
  if (diffDays === -1) return { label: 'Yesterday', overdue: true }
  const label = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(date)
  return { label, overdue: diffDays < 0 }
}
