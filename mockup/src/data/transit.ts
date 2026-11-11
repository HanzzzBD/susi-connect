/**
 * Data M-S20/M-S21 (rute moda umum, layanan `mobility/`). Semua sintetis.
 * Durasi = contoh perkiraan [ASUMSI]; tarif sengaja null → "—" (aturan repo #8: jangan mengarang harga).
 * Tanggal tarif resmi [PERLU DIVERIFIKASI].
 */
export interface TransitLeg {
  mode: 'jalan' | 'krl' | 'transjakarta' | 'mikrotrans'
  label: string
  from: string
  to: string
  minutes: number
}
export interface TransitOption {
  id: number
  totalMinutes: number
  fareIdr: number | null
  transfers: number
  walkMinutes: number
  legs: TransitLeg[]
}

/** Daftar halte offline (V2) — [ASUMSI] nama halte contoh di sekitar Tebet. */
export const OFFLINE_STOPS = ['Stasiun Tebet', 'Halte Jl. Prof. Dr. Soepomo', 'Stasiun Manggarai']

export const TRANSIT_OPTIONS: TransitOption[] = [
  {
    id: 1, totalMinutes: 24, fareIdr: null, transfers: 0, walkMinutes: 9,
    legs: [
      { mode: 'jalan', label: 'Jalan kaki', from: 'Lokasi saya', to: 'Stasiun Manggarai', minutes: 5 },
      { mode: 'krl', label: 'KRL', from: 'Stasiun Manggarai', to: 'Stasiun Tebet', minutes: 10 },
      { mode: 'jalan', label: 'Jalan kaki', from: 'Stasiun Tebet', to: 'Lokasi aksi', minutes: 9 },
    ],
  },
  {
    id: 2, totalMinutes: 31, fareIdr: null, transfers: 1, walkMinutes: 6,
    legs: [
      { mode: 'jalan', label: 'Jalan kaki', from: 'Lokasi saya', to: 'Halte Jl. Prof. Dr. Soepomo', minutes: 3 },
      { mode: 'transjakarta', label: 'Transjakarta', from: 'Halte Jl. Prof. Dr. Soepomo', to: 'Halte transit', minutes: 12 },
      { mode: 'mikrotrans', label: 'Mikrotrans', from: 'Halte transit', to: 'Dekat lokasi aksi', minutes: 13 },
      { mode: 'jalan', label: 'Jalan kaki', from: 'Dekat lokasi aksi', to: 'Lokasi aksi', minutes: 3 },
    ],
  },
  {
    id: 3, totalMinutes: 38, fareIdr: null, transfers: 0, walkMinutes: 4,
    legs: [
      { mode: 'jalan', label: 'Jalan kaki', from: 'Lokasi saya', to: 'Halte Jl. Prof. Dr. Soepomo', minutes: 2 },
      { mode: 'transjakarta', label: 'Transjakarta', from: 'Halte Jl. Prof. Dr. Soepomo', to: 'Dekat lokasi aksi', minutes: 34 },
      { mode: 'jalan', label: 'Jalan kaki', from: 'Dekat lokasi aksi', to: 'Lokasi aksi', minutes: 2 },
    ],
  },
]

/** Urutan per tab M-S21 — [ASUMSI] Terbaik = gabungan, Tercepat = durasi, Ternyaman = jalan kaki & transit paling sedikit, Termurah = belum bisa (tarif null). */
export const TRANSIT_TABS = ['Terbaik', 'Termurah', 'Tercepat', 'Ternyaman'] as const
export type TransitTab = (typeof TRANSIT_TABS)[number]
export function sortTransit(tab: TransitTab): TransitOption[] {
  const xs = [...TRANSIT_OPTIONS]
  if (tab === 'Tercepat') return xs.sort((a, b) => a.totalMinutes - b.totalMinutes)
  if (tab === 'Ternyaman') return xs.sort((a, b) => a.transfers - b.transfers || a.walkMinutes - b.walkMinutes)
  return xs
}
