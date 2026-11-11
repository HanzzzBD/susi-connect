/**
 * Format angka & waktu — UI-SPEC §0 "Format":
 * tanggal "7 Nov 2026, 09.12"; jarak "1,8 km" / "650 m"; durasi "± 7 menit"; desimal memakai koma.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const pad = (n: number) => String(n).padStart(2, '0')

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}`
}

/** "14 Nov, 23.59" — dipakai "Berlaku sampai" (UI-SPEC S13 #2). */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}.${pad(d.getMinutes())}`
}

export function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${formatDecimal(meters / 1000, 1)} km`
}

export function formatDuration(seconds: number): string {
  return `± ${Math.max(1, Math.round(seconds / 60))} menit`
}

/** Skor kartu match: 2 desimal, mis. "0,96" (UI-SPEC S08 #3). */
export function formatScore(value: number): string {
  return formatDecimal(value, 2)
}

/** "2 jam lalu" (UI-SPEC S06 #3). */
export function formatRelative(iso: string, now: Date): string {
  const diffMin = Math.round((now.getTime() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const h = Math.round(diffMin / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.round(h / 24)} hari lalu`
}

export function formatPercent(ratio: number): string {
  return `${formatDecimal(ratio * 100, 0)}%`
}
