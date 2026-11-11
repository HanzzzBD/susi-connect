/**
 * Match komunitas — PRD §13 (tabel skor 0,963 / 0,748 / 0,657) dan kalimat `reasons` SDD §6.4 butir 8.
 * L02 = 3 match diusulkan; L03 = match Melati diterima, lainnya "Tidak berlaku" (kedaluwarsa).
 */
import type { Match, MatchBreakdown } from './types'

const MELATI: MatchBreakdown = {
  K: 1.0, A: 1.0, W: 1.0, J: 0.92, T: 0.75, distanceKm: 0.8, available: 6, needed: 8,
  reasons: ['Fokus sampah', 'Punya keahlian angkut & pilah', 'Satu kelurahan', '0,8 km', '6 dari 8 relawan tersedia'],
}
const HIJAU: MatchBreakdown = {
  K: 1.0, A: 0.5, W: 0.5, J: 0.65, T: 1.0, distanceKm: 3.5, available: 10, needed: 8,
  reasons: ['Fokus sampah', 'Keahlian 1 dari 2', 'Satu kecamatan', '3,5 km', '10 dari 8 relawan tersedia'],
}
const RW05: MatchBreakdown = {
  K: 0.5, A: 0.5, W: 1.0, J: 0.96, T: 0.375, distanceKm: 0.4, available: 3, needed: 8,
  reasons: ['Komunitas umum', 'Keahlian 1 dari 2', 'Satu kelurahan', '0,4 km', '3 dari 8 relawan tersedia'],
}

const syn = { isSynthetic: true as const }

export const MATCHES: Match[] = [
  { ...syn, id: 1, reportId: 2, communityId: 1, rank: 1, score: 0.963, status: 'diusulkan', breakdown: MELATI },
  { ...syn, id: 2, reportId: 2, communityId: 2, rank: 2, score: 0.748, status: 'diusulkan', breakdown: HIJAU },
  { ...syn, id: 3, reportId: 2, communityId: 3, rank: 3, score: 0.657, status: 'diusulkan', breakdown: RW05 },
  { ...syn, id: 4, reportId: 3, communityId: 1, rank: 1, score: 0.963, status: 'diterima', breakdown: MELATI },
  { ...syn, id: 5, reportId: 3, communityId: 2, rank: 2, score: 0.748, status: 'kedaluwarsa', breakdown: HIJAU },
  { ...syn, id: 6, reportId: 3, communityId: 3, rank: 3, score: 0.657, status: 'kedaluwarsa', breakdown: RW05 },
]

/** Bobot PRD §13 (urutan tabel ScoreBreakdown). */
export const MATCH_WEIGHTS = [
  { key: 'K', label: 'Kategori', weight: 0.35 },
  { key: 'A', label: 'Keahlian', weight: 0.2 },
  { key: 'W', label: 'Wilayah', weight: 0.2 },
  { key: 'J', label: 'Jarak', weight: 0.15 },
  { key: 'T', label: 'Ketersediaan', weight: 0.1 },
] as const

export const matchById = (id: number) => MATCHES.find((m) => m.id === id)
