/**
 * Parses a YYYY-MM-DD string as a local date (avoids UTC midnight timezone shift).
 * `new Date('2026-04-01')` is treated as UTC and shifts to March 31 in UTC-3.
 * This function always returns the correct local date.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isSameMonth(dateStr: string, base: Date): boolean {
  const d = parseLocalDate(dateStr)
  return d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()
}
