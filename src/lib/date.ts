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
