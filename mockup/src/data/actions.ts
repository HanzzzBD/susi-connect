/**
 * Aksi & tugas — PRD §12.5 (A03 direncanakan, A04 berjalan, A05 menunggu_verifikasi, L06–L09 terverifikasi).
 * Tugas A03 persis PRD. Alat & catatan keselamatan dari contoh AI-PROMPTS §4.3 (sampah).
 * Jadwal, titik kumpul/buang, penugasan anggota, dan pembagian 14 jam / 120 kg per aksi = [ASUMSI].
 */
import type { Action } from './types'
import { onDay } from './clock'

const MEETING = { name: 'Pos RW 05', at: { lat: -6.2309, lng: 106.853 } } // nama dari placeholder UI-SPEC S09
const DROPOFF = { name: 'TPS Tebet Barat', at: { lat: -6.2352, lng: 106.858 } }
const TOOLS = ['sarung tangan', 'masker', 'karung', 'gerobak']
const SAFETY = [
  'Gunakan sarung tangan dan masker; jangan memungut benda tajam dengan tangan kosong.',
  'Jika ditemukan limbah medis/kimia atau benda mencurigakan, hentikan dan laporkan ke moderator.',
]
const syn = { isSynthetic: true as const }

export const ACTIONS: Action[] = [
  {
    ...syn,
    id: 3,
    code: 'A03',
    reportId: 3,
    communityId: 1,
    title: 'Bersih lahan musala',
    status: 'direncanakan',
    scheduledAt: onDay(2, 8),
    meetingPoint: MEETING,
    dropoff: DROPOFF,
    volunteers: 8,
    tools: TOOLS,
    safetyNotes: SAFETY,
    tasks: [
      { ...syn, id: 31, title: 'Angkut ke TPS', skill: 'angkut', quota: 2, assigneeIds: [11], status: 'terbuka', needsRoute: true, checkedInIds: [] },
      { ...syn, id: 32, title: 'Pemilahan', skill: 'pilah', quota: 4, assigneeIds: [12, 13], status: 'terbuka', needsRoute: false, checkedInIds: [] },
      { ...syn, id: 33, title: 'Dokumentasi', skill: 'dokumentasi', quota: 1, assigneeIds: [], status: 'terbuka', needsRoute: false, checkedInIds: [] },
    ],
  },
  {
    ...syn,
    id: 4,
    code: 'A04',
    reportId: 4,
    communityId: 1,
    title: 'Bersih ujung Gg. Masjid',
    status: 'berjalan',
    scheduledAt: onDay(0, 8),
    meetingPoint: MEETING,
    dropoff: DROPOFF,
    volunteers: 3,
    tools: TOOLS,
    safetyNotes: SAFETY,
    tasks: [
      { ...syn, id: 41, title: 'Angkut ke TPS', skill: 'angkut', quota: 2, assigneeIds: [3, 11], status: 'diambil', needsRoute: true, checkedInIds: [3] },
      { ...syn, id: 42, title: 'Dokumentasi', skill: 'dokumentasi', quota: 1, assigneeIds: [], status: 'terbuka', needsRoute: false, checkedInIds: [] },
    ],
  },
  {
    ...syn,
    id: 5,
    code: 'A05',
    reportId: 5,
    communityId: 1,
    title: 'Bersih pinggir lapangan voli',
    status: 'menunggu_verifikasi',
    scheduledAt: onDay(-1, 7),
    meetingPoint: MEETING,
    volunteers: 3,
    tools: TOOLS,
    safetyNotes: SAFETY,
    tasks: [
      { ...syn, id: 51, title: 'Pengumpulan & pemilahan sampah', skill: 'pilah', quota: 3, assigneeIds: [3, 12, 13], status: 'selesai', needsRoute: false, checkedInIds: [3, 12, 13] },
    ],
    volunteerHours: 6, // 3 × 2 jam (PRD §12.5)
    wasteKg: 45,
  },
  ...[6, 7, 8, 9].map<Action>((id, i) => ({
    ...syn,
    id,
    code: `A0${id}`,
    reportId: id,
    communityId: id % 2 === 0 ? 1 : 2,
    title: `Kerja bakti laporan L0${id}`,
    status: 'terverifikasi',
    scheduledAt: onDay(-18 + id, 7),
    meetingPoint: MEETING,
    volunteers: 4,
    tools: TOOLS,
    safetyNotes: SAFETY,
    tasks: [
      { ...syn, id: id * 10 + 1, title: 'Pengumpulan & pemilahan sampah', skill: 'pilah', quota: 4, assigneeIds: [11, 12, 13, 14], status: 'selesai', needsRoute: false, checkedInIds: [11, 12, 13, 14] },
    ],
    volunteerHours: [4, 4, 3, 3][i], // total 14 jam (PRD §12.5)
    wasteKg: 30, // total 120 kg (PRD §12.5)
  })),
]

export const actionById = (id: number) => ACTIONS.find((a) => a.id === id)

/** Daftar anggota komunitas untuk "Tugaskan ke" (G2). */
export const COMMUNITY_MEMBER_IDS: Record<number, number[]> = {
  1: [4, 3, 11, 12, 13, 14],
  2: [5],
  3: [6],
}
