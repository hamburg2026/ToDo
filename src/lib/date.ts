// Parse a yyyy-mm-dd date string as a local calendar date (not UTC midnight),
// so it always displays as the day the user picked regardless of timezone.
export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return parseLocalDate(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return ''
  return parseLocalDate(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

// Whole days from today to the given date; negative when the date is in the past.
export function daysUntil(iso: string): number {
  const today = startOfDay(new Date()).getTime()
  const target = startOfDay(parseLocalDate(iso)).getTime()
  return Math.round((target - today) / (24 * 60 * 60 * 1000))
}

// Format a Date.now()-style timestamp as a German date + time string.
export function formatDateTime(ts: number | null): string {
  if (!ts) return ''
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
