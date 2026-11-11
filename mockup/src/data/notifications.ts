/**
 * Notifikasi — [ASUMSI] PRD §12 tidak memuat seed notifikasi. Isi disusun dari efek samping endpoint
 * di API.md (notifikasi ke pelapor/koordinator/moderator) dan memakai teks status PRD §8.6.
 */
import type { NotificationItem } from './types'
import { at } from './clock'

const syn = { isSynthetic: true as const }

export const NOTIFICATIONS: NotificationItem[] = [
  { ...syn, id: 1, userPersona: 'warga', title: 'Bukti perlu konfirmasimu', body: 'Komunitas mengunggah bukti sesudah untuk "Sampah di pinggir lapangan voli".', createdAt: at(-1), read: false, link: '/laporan/5' },
  { ...syn, id: 2, userPersona: 'warga', title: 'Laporan diverifikasi', body: '"Got mampet depan Gg. Hijau" kini berstatus Diverifikasi.', createdAt: at(-2), read: true, link: '/laporan/12' },
  { ...syn, id: 3, userPersona: 'relawan', title: 'Aksi baru butuh relawan', body: '"Bersih lahan musala" — 1 tugas Dokumentasi masih terbuka.', createdAt: at(0, -3), read: false, link: '/aksi/3' },
  { ...syn, id: 4, userPersona: 'koordinator', title: 'Rekomendasi baru', body: 'Laporan "(Cadangan) Sampah menumpuk di lahan samping musala" cocok untuk komunitasmu.', createdAt: at(0, -1), read: false, link: '/rekomendasi/1' },
  { ...syn, id: 5, userPersona: 'moderator', title: 'Bukti menunggu verifikasi', body: 'Aksi "Bersih pinggir lapangan voli" mengajukan verifikasi.', createdAt: at(-1), read: false, link: '/bukti' },
  { ...syn, id: 6, userPersona: 'instansi', title: 'Rujukan baru', body: '"Trotoar retak depan sekolah" diteruskan ke instansi.', createdAt: at(-3), read: true, link: '/rujukan/1' },
]
