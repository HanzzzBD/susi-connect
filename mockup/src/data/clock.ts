/**
 * Waktu acuan mockup. PRD §12: waktu seed relatif terhadap T (saat seed dijalankan).
 * [ASUMSI] T dibekukan ke 10 Nov 2026 09.12 agar tampilan stabil.
 */
export const NOW = new Date(2026, 10, 10, 9, 12, 0)

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`

/** ISO lokal untuk T + hari/jam/menit (boleh negatif). */
export function at(days: number, hours = 0, minutes = 0): string {
  return toIso(new Date(NOW.getTime() + ((days * 24 + hours) * 60 + minutes) * 60000))
}

/** Tanggal T + hari pada jam tetap. */
export function onDay(days: number, hh: number, mm = 0): string {
  const d = new Date(NOW)
  d.setDate(d.getDate() + days)
  d.setHours(hh, mm, 0, 0)
  return toIso(d)
}
