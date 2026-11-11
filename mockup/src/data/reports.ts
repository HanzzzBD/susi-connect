/**
 * PRD §12.5 — laporan seed L01–L15 (semua sintetis).
 * Judul, kategori, status, dan detail tambahan persis PRD. Deskripsi L01–L03, L10, L13 dan isi triase
 * diambil dari contoh AI-PROMPTS §2.3 / §3.3 / §7.4. Deskripsi lain, koordinat selain L00,
 * dan pelapor yang tidak disebut PRD = [ASUMSI].
 */
import type { Report, Triage } from './types'
import { at } from './clock'

/** Titik demo utama L00 (PRD §12.5). */
export const L00 = { lat: -6.2319, lng: 106.8541 }

const TRIAGE_SAMPAH_GEMINI: Triage = {
  status: 'done',
  source: 'gemini',
  category: 'sampah',
  urgency: 'sedang',
  handling: 'komunitas',
  hazards: [],
  skills: ['angkut', 'pilah'],
  estVolunteers: 8,
  reason:
    'Sampah rumah tangga menumpuk di ruang terbuka tanpa indikasi limbah berbahaya; bisa ditangani lewat kerja bakti dan pengangkutan ke TPS.',
  confidence: 0.78,
}

/** Fallback AI-PROMPTS §7.4: alasan "Ditentukan aturan kata kunci: …", keyakinan 0,4. */
const triageRule = (over: Partial<Triage>): Triage => ({
  ...TRIAGE_SAMPAH_GEMINI,
  source: 'aturan',
  confidence: 0.4,
  reason: 'Ditentukan aturan kata kunci: sampah, menumpuk.',
  ...over,
})

const DESC_MUSALA =
  'Sampah menumpuk sekitar satu minggu di lahan kosong samping Musala Al-Ikhlas RT 03, berbau dan banyak lalat.'

const syn = { isSynthetic: true as const, kecamatan: 'Tebet' }

export const REPORTS: Report[] = [
  {
    ...syn,
    id: 1,
    code: 'L01',
    title: '(Cadangan) Sampah menumpuk di lahan samping musala',
    description: DESC_MUSALA,
    category: 'sampah',
    status: 'menunggu',
    kelurahan: 'Tebet Barat',
    location: L00,
    landmark: 'Lahan kosong samping Musala Al-Ikhlas, RT 03',
    since: '±1 minggu',
    createdAt: at(-8, -1),
    reporterId: 1,
    photoCount: 1,
    triage: TRIAGE_SAMPAH_GEMINI,
    history: [{ status: 'menunggu', byRole: 'warga', at: at(-8, -1) }],
    duplicateCandidates: [{ reportId: 15, distanceM: 42 }],
  },
  {
    ...syn,
    id: 2,
    code: 'L02',
    title: '(Cadangan) Sampah menumpuk di lahan samping musala',
    description: DESC_MUSALA,
    category: 'sampah',
    status: 'diverifikasi',
    kelurahan: 'Tebet Barat',
    location: L00,
    landmark: 'Lahan kosong samping Musala Al-Ikhlas, RT 03',
    since: '±1 minggu',
    createdAt: at(-8, -2),
    reporterId: 1,
    photoCount: 1,
    triage: TRIAGE_SAMPAH_GEMINI,
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-8, -2) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-8, 1) },
    ],
  },
  {
    ...syn,
    id: 3,
    code: 'L03',
    title: '(Cadangan) Sampah menumpuk di lahan samping musala',
    description: DESC_MUSALA,
    category: 'sampah',
    status: 'dikoordinasikan',
    kelurahan: 'Tebet Barat',
    location: L00,
    landmark: 'Lahan kosong samping Musala Al-Ikhlas, RT 03',
    since: '±1 minggu',
    createdAt: at(-8, -3),
    reporterId: 1,
    photoCount: 2,
    triage: TRIAGE_SAMPAH_GEMINI,
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-8, -3) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-8, 0) },
      { status: 'dikoordinasikan', byRole: 'koordinator', at: at(-8, 3) },
    ],
    actionId: 3,
  },
  {
    ...syn,
    id: 4,
    code: 'L04',
    title: 'Sampah di ujung Gg. Masjid',
    description: 'Tumpukan kantong sampah di ujung Gg. Masjid, sebagian sudah robek dan berceceran ke jalan.', // [ASUMSI]
    category: 'sampah',
    status: 'dikoordinasikan',
    kelurahan: 'Tebet Barat',
    location: { lat: -6.2302, lng: 106.8556 }, // [ASUMSI]
    createdAt: at(-5, -2),
    reporterId: 1,
    photoCount: 1,
    triage: { ...TRIAGE_SAMPAH_GEMINI, source: 'cache' },
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-5, -2) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-5, 1) },
      { status: 'dikoordinasikan', byRole: 'koordinator', at: at(-4) },
    ],
    actionId: 4,
  },
  {
    ...syn,
    id: 5,
    code: 'L05',
    title: 'Sampah di pinggir lapangan voli',
    description: 'Sampah plastik dan sisa makanan menumpuk di pinggir lapangan voli setelah acara warga.', // [ASUMSI]
    category: 'sampah',
    status: 'dikoordinasikan',
    kelurahan: 'Tebet Timur',
    location: { lat: -6.2338, lng: 106.8592 }, // [ASUMSI]
    createdAt: at(-6, -4),
    reporterId: 1,
    photoCount: 1,
    triage: triageRule({}),
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-6, -4) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-6, -1) },
      { status: 'dikoordinasikan', byRole: 'koordinator', at: at(-5) },
    ],
    actionId: 5,
  },
  // L06–L09: "Empat laporan sampah/lingkungan lain", selesai. Judul spesifik tidak ada di PRD → [ASUMSI].
  ...[
    { id: 6, title: 'Sampah di bantaran saluran Tebet Timur', category: 'sampah' as const, kel: 'Tebet Timur', loc: { lat: -6.2355, lng: 106.8601 } },
    { id: 7, title: 'Ranting menutupi jalan setapak taman', category: 'lingkungan_lain' as const, kel: 'Tebet Barat', loc: { lat: -6.2291, lng: 106.8521 } },
    { id: 8, title: 'Sampah liar di lahan kosong Kebon Baru', category: 'sampah' as const, kel: 'Kebon Baru', loc: { lat: -6.2412, lng: 106.8633 } },
    { id: 9, title: 'Rumput liar dan sampah di sekitar pos ronda', category: 'lingkungan_lain' as const, kel: 'Tebet Timur', loc: { lat: -6.2367, lng: 106.8578 } },
  ].map<Report>((r) => ({
    ...syn,
    id: r.id,
    code: `L0${r.id}`,
    title: r.title,
    description: 'Laporan contoh yang sudah selesai ditangani komunitas (sintetis).',
    category: r.category,
    status: 'selesai',
    kelurahan: r.kel,
    location: r.loc,
    createdAt: at(-20 + r.id),
    reporterId: 1,
    photoCount: 1,
    triage:
      r.category === 'sampah'
        ? TRIAGE_SAMPAH_GEMINI
        : triageRule({ category: 'lingkungan_lain', skills: ['angkut'], estVolunteers: 4, reason: 'Ditentukan aturan kata kunci: ranting, rumput liar.' }),
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-20 + r.id) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-20 + r.id, 2) },
      { status: 'dikoordinasikan', byRole: 'koordinator', at: at(-19 + r.id) },
      { status: 'selesai', byRole: 'moderator', at: at(-17 + r.id) },
    ],
    actionId: r.id,
  })),
  {
    ...syn,
    id: 10,
    code: 'L10',
    title: 'Trotoar berlubang dekat halte Jl. Prof. Dr. Soepomo',
    description:
      'Trotoar di depan halte Jl. Prof. Dr. Soepomo berlubang besar sekitar 1 meter, sudah ada pejalan kaki yang terperosok.',
    category: 'jalan_trotoar',
    status: 'menunggu',
    kelurahan: 'Tebet Barat',
    location: { lat: -6.2276, lng: 106.8489 }, // [ASUMSI]
    landmark: 'Depan halte Jl. Prof. Dr. Soepomo',
    createdAt: at(0, -2),
    reporterId: 2,
    photoCount: 1,
    triage: {
      status: 'done',
      source: 'gemini',
      category: 'jalan_trotoar',
      urgency: 'tinggi',
      handling: 'instansi',
      hazards: [],
      skills: [],
      estVolunteers: null,
      reason:
        'Perbaikan trotoar adalah infrastruktur publik yang butuh kewenangan dan material; sudah ada pejalan kaki terperosok.',
      confidence: 0.9,
    },
    history: [{ status: 'menunggu', byRole: 'warga', at: at(0, -2) }],
  },
  {
    ...syn,
    id: 11,
    code: 'L11',
    title: 'Trotoar retak depan sekolah',
    description: 'Paving trotoar di depan sekolah retak dan terangkat, anak-anak sering tersandung saat pulang sekolah.', // [ASUMSI]
    category: 'jalan_trotoar',
    status: 'diteruskan_instansi',
    kelurahan: 'Tebet Timur',
    location: { lat: -6.2331, lng: 106.8547 }, // [ASUMSI]
    landmark: 'Depan sekolah', // [ASUMSI]
    createdAt: at(-3, -5),
    reporterId: 2,
    photoCount: 1,
    triage: {
      status: 'done',
      source: 'gemini',
      category: 'jalan_trotoar',
      urgency: 'tinggi',
      handling: 'instansi',
      hazards: [],
      skills: [],
      estVolunteers: null,
      reason: 'Kerusakan trotoar butuh perbaikan oleh instansi berwenang; berisiko membuat pejalan kaki tersandung.', // [ASUMSI]
      confidence: 0.84,
      // Contoh teks koreksi UI-SPEC S05 #3
      override: { field: 'urgensi', from: 'sedang', to: 'tinggi' },
    },
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-3, -5) },
      { status: 'diteruskan_instansi', byRole: 'moderator', at: at(-3, -2) },
    ],
    referralId: 1,
  },
  {
    ...syn,
    id: 12,
    code: 'L12',
    title: 'Got mampet depan Gg. Hijau',
    description: 'Got di depan Gg. Hijau mampet oleh sampah plastik, air meluap ke jalan setiap hujan.', // [ASUMSI]
    category: 'drainase',
    status: 'diverifikasi',
    kelurahan: 'Tebet Barat',
    location: { lat: -6.2287, lng: 106.857 }, // [ASUMSI]
    landmark: 'Depan Gg. Hijau',
    createdAt: at(-2, -3),
    reporterId: 1,
    photoCount: 2,
    triage: triageRule({
      category: 'drainase',
      handling: 'campuran',
      skills: ['bersih_saluran', 'angkut'],
      estVolunteers: 5,
      reason: 'Ditentukan aturan kata kunci: got, mampet, air meluap.',
    }),
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-2, -3) },
      { status: 'diverifikasi', byRole: 'moderator', at: at(-2) },
    ],
    referralId: 2,
  },
  {
    ...syn,
    id: 13,
    code: 'L13',
    title: 'Tumpukan sampah klinik di pojok gang',
    description:
      'Di pojok gang ada kantong sampah berisi jarum suntik dan botol infus bekas, anak-anak sering main di situ.',
    category: 'sampah',
    status: 'menunggu',
    kelurahan: 'Manggarai',
    location: { lat: -6.2101, lng: 106.8488 }, // [ASUMSI]
    landmark: 'Pojok gang',
    createdAt: at(0, -5),
    reporterId: 1,
    photoCount: 1,
    triage: {
      status: 'done',
      source: 'gemini',
      category: 'sampah',
      urgency: 'tinggi',
      handling: 'instansi',
      hazards: ['limbah_medis'],
      skills: [],
      estVolunteers: null,
      reason:
        'Ada jarum suntik dan botol infus bekas (limbah medis) yang berbahaya bila disentuh; perlu petugas berwenang.',
      confidence: 0.93,
    },
    history: [{ status: 'menunggu', byRole: 'warga', at: at(0, -5) }],
  },
  {
    ...syn,
    id: 14,
    code: 'L14',
    title: 'Sampah samping musala (duplikat)',
    description: 'Sampah numpuk di samping musala.', // [ASUMSI]
    category: 'sampah',
    status: 'ditolak',
    kelurahan: 'Tebet Barat',
    location: { lat: -6.23192, lng: 106.85415 }, // [ASUMSI]
    createdAt: at(-7, -6),
    reporterId: 2,
    photoCount: 0,
    triage: TRIAGE_SAMPAH_GEMINI,
    history: [
      { status: 'menunggu', byRole: 'warga', at: at(-7, -6) },
      { status: 'ditolak', byRole: 'moderator', at: at(-7, -3), reason: 'Sama dengan laporan #1.' },
    ],
    rejectReason: 'duplikat',
    rejectNote: 'Sama dengan laporan #1.', // [ASUMSI]
    duplicateOf: 1,
  },
  {
    ...syn,
    id: 15,
    code: 'L15',
    title: 'Sampah dekat musala, sisi timur',
    description: 'Ada tumpukan sampah di sisi timur musala, baunya sampai ke jalan.', // [ASUMSI]
    category: 'sampah',
    status: 'menunggu',
    kelurahan: 'Tebet Barat',
    location: { lat: -6.2319, lng: 106.85448 }, // ±42 m dari L01
    createdAt: at(-9),
    reporterId: 1,
    photoCount: 1,
    triage: TRIAGE_SAMPAH_GEMINI,
    history: [{ status: 'menunggu', byRole: 'warga', at: at(-9) }],
    duplicateCandidates: [{ reportId: 1, distanceM: 42 }],
  },
]

export const reportById = (id: number) => REPORTS.find((r) => r.id === id)

/** Peta publik memakai lokasi dibulatkan 3 desimal (aturan repo #4, `reports_public`). */
export const roundPublic = (n: number) => Math.round(n * 1000) / 1000
