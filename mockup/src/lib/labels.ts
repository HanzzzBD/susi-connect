/**
 * Label UI — sumber tunggal untuk mockup (nanti dipindah ke shared/labels.ts, SDD §8A.3).
 * Disalin persis dari PRD §8 (kamus istilah) dan UI-SPEC §0. Jangan menulis ulang label di layar.
 */

// ---------- PRD §8.1 Kategori laporan ----------
export const CATEGORIES = [
  'sampah',
  'drainase',
  'jalan_trotoar',
  'penerangan',
  'fasilitas_umum',
  'lingkungan_lain',
  'sosial',
] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABEL: Record<Category, string> = {
  sampah: 'Sampah',
  drainase: 'Saluran air / drainase',
  jalan_trotoar: 'Jalan & trotoar',
  penerangan: 'Penerangan jalan',
  fasilitas_umum: 'Fasilitas umum',
  lingkungan_lain: 'Lingkungan lainnya',
  sosial: 'Bantuan sosial warga',
}

/** Kategori komunitas "umum" (PRD §12.3, §13: K = 0,5). Bukan kategori laporan. */
export const COMMUNITY_GENERAL_LABEL = 'Umum'

// ---------- PRD §8.2 Urgensi ----------
export const URGENCIES = ['rendah', 'sedang', 'tinggi', 'darurat'] as const
export type Urgency = (typeof URGENCIES)[number]
export const URGENCY_LABEL: Record<Urgency, string> = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
  darurat: 'Darurat',
}

// ---------- PRD §8.3 Jenis penanganan ----------
export const HANDLINGS = ['komunitas', 'instansi', 'campuran'] as const
export type Handling = (typeof HANDLINGS)[number]
export const HANDLING_LABEL: Record<Handling, string> = {
  komunitas: 'Bisa ditangani komunitas',
  instansi: 'Perlu instansi',
  campuran: 'Komunitas + instansi',
}

// ---------- PRD §8.4 Penanda bahaya ----------
export const HAZARDS = [
  'limbah_medis',
  'limbah_b3_kimia',
  'asbes',
  'struktur_rusak',
  'listrik',
  'lahan_privat',
  'hewan_berbahaya',
  'air_dalam',
] as const
export type Hazard = (typeof HAZARDS)[number]
export const HAZARD_LABEL: Record<Hazard, string> = {
  limbah_medis: 'Limbah medis',
  limbah_b3_kimia: 'Limbah B3/kimia',
  asbes: 'Asbes',
  struktur_rusak: 'Struktur rusak',
  listrik: 'Instalasi listrik',
  lahan_privat: 'Lahan privat',
  hewan_berbahaya: 'Hewan berbahaya',
  air_dalam: 'Air dalam',
}

// ---------- PRD §8.5 Jenis hambatan ----------
export const OBSTACLE_TYPES = [
  'perbaikan_jalan',
  'demo',
  'banjir',
  'pohon_tumbang',
  'kegiatan_warga',
  'lainnya',
] as const
export type ObstacleType = (typeof OBSTACLE_TYPES)[number]
export const OBSTACLE_TYPE_LABEL: Record<ObstacleType, string> = {
  perbaikan_jalan: 'Perbaikan/galian jalan',
  demo: 'Aksi massa/demo',
  banjir: 'Genangan/banjir',
  pohon_tumbang: 'Pohon tumbang',
  kegiatan_warga: 'Kegiatan warga',
  lainnya: 'Lainnya',
}
/** Masa berlaku default dalam jam — PRD §8.5 [ASUMSI di PRD]. */
export const OBSTACLE_DEFAULT_HOURS: Record<ObstacleType, number> = {
  perbaikan_jalan: 24 * 7,
  demo: 24,
  banjir: 24 * 7,
  pohon_tumbang: 24 * 7,
  kegiatan_warga: 24,
  lainnya: 24 * 7,
}

// ---------- PRD §8.6 Status ----------
export const REPORT_STATUSES = [
  'menunggu',
  'diverifikasi',
  'dikoordinasikan',
  'diteruskan_instansi',
  'selesai',
  'ditolak',
] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]
export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  menunggu: 'Menunggu verifikasi',
  diverifikasi: 'Diverifikasi',
  dikoordinasikan: 'Dikoordinasikan komunitas',
  diteruskan_instansi: 'Diteruskan ke instansi',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
}

export type ActionStatus = 'direncanakan' | 'berjalan' | 'menunggu_verifikasi' | 'terverifikasi' | 'dibatalkan'
export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  direncanakan: 'Direncanakan',
  berjalan: 'Berjalan',
  menunggu_verifikasi: 'Menunggu verifikasi bukti',
  terverifikasi: 'Terverifikasi',
  dibatalkan: 'Dibatalkan',
}

export type TaskStatus = 'terbuka' | 'diambil' | 'selesai'
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  terbuka: 'Terbuka',
  diambil: 'Penuh',
  selesai: 'Selesai',
}

export type MatchStatus = 'diusulkan' | 'diterima' | 'ditolak' | 'kedaluwarsa'
export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  diusulkan: 'Diusulkan',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
  kedaluwarsa: 'Tidak berlaku',
}

export type ReferralStatus = 'draf' | 'terkirim' | 'ditindaklanjuti'
export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  draf: 'Draf',
  terkirim: 'Terkirim',
  ditindaklanjuti: 'Ditindaklanjuti',
}

/** `kedaluwarsa` adalah status turunan (tidak disimpan) — PRD §8.6. */
export type ObstacleStatus = 'menunggu_konfirmasi' | 'aktif' | 'kedaluwarsa' | 'dicabut'
export const OBSTACLE_STATUS_LABEL: Record<ObstacleStatus, string> = {
  menunggu_konfirmasi: 'Menunggu konfirmasi',
  aktif: 'Aktif',
  kedaluwarsa: 'Kedaluwarsa',
  dicabut: 'Dicabut',
}

export type EvidenceStatus = 'menunggu' | 'sah' | 'ditolak'
export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  menunggu: 'Menunggu',
  sah: 'Sah',
  ditolak: 'Ditolak',
}

// ---------- Alasan tolak (API.md REJECT_REASONS, teks radio UI-SPEC S06 #10) ----------
export const REJECT_REASONS = ['palsu', 'duplikat', 'di_luar_cakupan', 'data_kurang', 'lainnya'] as const
export type RejectReason = (typeof REJECT_REASONS)[number]
export const REJECT_REASON_LABEL: Record<RejectReason, string> = {
  palsu: 'Palsu',
  duplikat: 'Duplikat',
  di_luar_cakupan: 'Di luar cakupan',
  data_kurang: 'Data kurang',
  lainnya: 'Lainnya',
}

// ---------- Keahlian (AI-PROMPTS §1 kosakata `communities.skills`) ----------
export const SKILLS = [
  'angkut',
  'pilah',
  'dokumentasi',
  'bersih_saluran',
  'logistik',
  'pendampingan',
  'perbaikan_ringan',
] as const
export type Skill = (typeof SKILLS)[number]
/** [ASUMSI] Dokumen hanya memuat nilai teknis; label = nilai dengan huruf kapital & spasi. */
export const SKILL_LABEL: Record<Skill, string> = {
  angkut: 'Angkut',
  pilah: 'Pilah',
  dokumentasi: 'Dokumentasi',
  bersih_saluran: 'Bersih saluran',
  logistik: 'Logistik',
  pendampingan: 'Pendampingan',
  perbaikan_ringan: 'Perbaikan ringan',
}

// ---------- Lencana AI (UI-SPEC §0) ----------
export type AiSource = 'gemini' | 'cache' | 'aturan'
export const AI_SOURCE_LABEL: Record<AiSource, string> = {
  gemini: 'Saran AI',
  cache: 'Saran AI (tersimpan)',
  aturan: 'Aturan otomatis',
}
/** API.md: rendah < 0,5 ≤ sedang < 0,8 ≤ tinggi (ditampilkan sebagai kata, bukan persen). */
export function confidenceWord(value: number): 'rendah' | 'sedang' | 'tinggi' {
  if (value < 0.5) return 'rendah'
  if (value < 0.8) return 'sedang'
  return 'tinggi'
}

// ---------- Moda rute (API.md P2) ----------
export type RouteProfile = 'foot-walking' | 'cycling-regular' | 'driving-car'
export const ROUTE_PROFILE_LABEL: Record<RouteProfile, string> = {
  'foot-walking': 'Jalan kaki',
  'cycling-regular': 'Sepeda',
  'driving-car': 'Motor/mobil',
}
/** Lencana sumber rute (UI-SPEC S11 #5). */
export type RouteSource = 'ors' | 'cache' | 'straight'
export const ROUTE_SOURCE_LABEL: Record<RouteSource, string> = {
  ors: 'Rute OpenRouteService',
  cache: 'Rute tersimpan',
  straight: 'Garis lurus',
}

// ---------- Persona (PRD §6, UI-SPEC M0) ----------
export const PERSONAS = ['tamu', 'warga', 'relawan', 'koordinator', 'moderator', 'instansi', 'admin'] as const
export type Persona = (typeof PERSONAS)[number]
export const PERSONA_LABEL: Record<Persona, string> = {
  tamu: 'Tamu',
  warga: 'Warga',
  relawan: 'Relawan',
  koordinator: 'Koordinator',
  moderator: 'Moderator',
  instansi: 'Instansi',
  admin: 'Admin',
}

// ---------- Teks bersama UI-SPEC §0 ----------
export const TEXT = {
  fallbackBanner:
    'Mode cadangan aktif. Saran AI memakai aturan/rekaman, rute bisa berupa perkiraan garis lurus. Data tetap tersimpan.',
  hotspotBanner:
    'Terhubung lewat hotspot laptop (tanpa internet). Peta dan saran AI memakai mode cadangan.',
  networkError: 'Tidak bisa terhubung ke server. Pastikan backend berjalan.',
  retry: 'Coba lagi',
  sessionExpired: 'Sesi berakhir, silakan masuk lagi.',
  notFound: 'Halaman atau data tidak ditemukan.',
  backHome: 'Kembali ke beranda',
  forbidden: (role: string) => `Halaman ini hanya untuk ${role}.`,
  photoUnavailable: 'Foto tidak tersedia',
  syntheticBanner: 'Angka ini berasal dari data sintetis untuk demo, bukan dampak nyata.',
  syntheticBadge: 'Data sintetis',
  whyButton: 'Kenapa?',
  confidence: (w: string) => `Tingkat keyakinan: ${w}`,
  learnAi: 'Pelajari cara kerja AI',
} as const

/** Teks izin perangkat — UI-SPEC M "Teks izin perangkat" & "Izin notifikasi push". */
export const PERMISSION_TEXT = {
  lokasi: {
    explain:
      'SUSI Connect memakai lokasimu hanya untuk menandai titik laporan dan menghitung rute ke lokasi aksi. Lokasimu tidak disimpan.',
    denied: 'Izin lokasi ditolak. Tandai titik secara manual di peta.',
  },
  kamera: {
    explain: 'Kamera dipakai untuk memotret masalah dan bukti penyelesaian. Data lokasi di foto dihapus otomatis.',
    denied: 'Izin kamera ditolak. Pilih foto dari galeri.',
  },
  galeri: {
    explain: 'Pilih foto masalah atau bukti dari galeri.',
    denied: 'Izin galeri ditolak. Ambil foto dengan kamera.',
  },
  notifikasi: {
    explain: 'Izinkan SUSI Connect mengirim notifikasi saat laporan atau tugasmu berubah status.',
    denied: 'Notifikasi tetap bisa dilihat di lonceng.',
  },
} as const
export type PermissionKind = keyof typeof PERMISSION_TEXT
