/**
 * PRD §12.4 — kanal instansi. Aturan repo #9: tidak ada klaim integrasi; hanya tautan kanal resmi.
 */
import type { Agency } from './types'

export const AGENCIES: Agency[] = [
  {
    id: 1,
    name: 'SP4N-LAPOR!',
    url: 'https://www.lapor.go.id',
    categories: 'semua',
    kecamatan: null,
    note: 'Kanal pengaduan pelayanan publik nasional',
    isSynthetic: true,
  },
  {
    id: 2,
    name: 'JAKI (Pemprov DKI Jakarta)',
    url: null, // [PERLU DIVERIFIKASI URL resmi] — PRD §12.4
    categories: 'jalan_trotoar, penerangan, drainase, fasilitas_umum, sampah',
    kecamatan: null,
    note: 'Kanal aduan warga DKI [PERLU DIVERIFIKASI]',
    isSynthetic: true,
  },
  {
    id: 3,
    name: 'Kantor Kelurahan Tebet Barat (sintetis)',
    url: 'https://www.lapor.go.id', // placeholder — PRD §12.4
    categories: 'sampah, fasilitas_umum',
    kecamatan: 'Tebet',
    note: 'Kontak kelurahan belum diverifikasi; jangan ditampilkan sebagai kanal nyata',
    isSynthetic: true,
  },
]

export const agencyById = (id: number) => AGENCIES.find((a) => a.id === id)
