/**
 * Registri layar mockup: ID UI-SPEC, route, peran yang boleh membuka, dan state/varian yang bisa dipilih
 * dari panel dev. Router & panel dev membaca daftar ini (satu sumber).
 */
import type { ReactNode } from 'react'
import type { Persona } from '../lib/labels'
import M0More from '../screens/M0More'
import MS01Login from '../screens/MS01Login'
import MS02Map from '../screens/MS02Map'
import MS03Report from '../screens/MS03Report'
import MS04MyReports from '../screens/MS04MyReports'
import MS05ReportDetail from '../screens/MS05ReportDetail'
import MS06Moderation from '../screens/MS06Moderation'
import MS06ModerationDetail from '../screens/MS06ModerationDetail'
import MS08Recommendations from '../screens/MS08Recommendations'
import MS08ScoreDetail from '../screens/MS08ScoreDetail'
import MS09CreateAction from '../screens/MS09CreateAction'
import MS10MyActions from '../screens/MS10MyActions'
import MS11ActionDetail from '../screens/MS11ActionDetail'
import MS12ReferralDetail from '../screens/MS12ReferralDetail'
import MS12Referrals from '../screens/MS12Referrals'
import MS13Obstacles from '../screens/MS13Obstacles'
import MS14Impact from '../screens/MS14Impact'
import MS15AboutAi from '../screens/MS15AboutAi'
import MS16Notifications from '../screens/MS16Notifications'
import MS18Help from '../screens/MS18Help'
import MS19ServerSettings from '../screens/MS19ServerSettings'
import MS20RouteSearch from '../screens/MS20RouteSearch'
import MS21RouteResult from '../screens/MS21RouteResult'
import MS22Admin from '../screens/MS22Admin'

export interface Variant {
  key: string
  label: string
}

export interface ScreenMeta {
  id: string
  title: string
  path: string
  /** URL contoh untuk "Lompat ke layar" di panel dev. */
  sample: string
  element: ReactNode
  /** Kosong = semua persona (termasuk tamu). */
  personas?: Persona[]
  /** Butuh login (tamu diarahkan ke /login?next=). */
  login?: boolean
  /** State standar yang relevan (default: sukses, memuat, kosong, galat). */
  std?: string[]
  variants?: Variant[]
}

const STD = ['sukses', 'memuat', 'kosong', 'galat']
const NO_EMPTY = ['sukses', 'memuat', 'galat']
const LOGGED: Persona[] = ['warga', 'relawan', 'koordinator', 'moderator', 'instansi', 'admin']

export const SCREENS: ScreenMeta[] = [
  {
    id: 'M-S01', title: 'Masuk', path: '/login', sample: '/login', element: <MS01Login />,
    std: ['sukses', 'memuat', 'galat'],
    variants: [
      { key: 'gagal', label: 'Gagal login' },
      { key: '429', label: '429 terlalu banyak percobaan' },
      { key: 'demo_nonaktif', label: 'Demo nonaktif' },
    ],
  },
  {
    id: 'M-S02', title: 'Peta', path: '/peta', sample: '/peta', element: <MS02Map />,
    variants: [{ key: 'offline', label: 'Peta dasar offline' }],
  },
  {
    id: 'M-S03A/B', title: 'Lapor', path: '/lapor', sample: '/lapor', element: <MS03Report />, login: true, std: ['sukses'],
    variants: [
      { key: 'ai_berpikir', label: 'AI berpikir' },
      { key: 'off_topic', label: 'Off topic' },
      { key: 'darurat', label: 'Urgensi darurat' },
      { key: 'redirect_form', label: 'Pindah ke formulir' },
      { key: '429', label: '429 terlalu cepat' },
      { key: 'izin_ditolak', label: 'Izin ditolak' },
      { key: 'luar_dki', label: 'Lokasi di luar DKI' },
      { key: 'foto_besar', label: 'Foto > 5 MB' },
      { key: 'foto_format', label: 'Format foto salah' },
    ],
  },
  { id: 'M-S04', title: 'Laporan Saya', path: '/laporanku', sample: '/laporanku', element: <MS04MyReports />, login: true },
  {
    id: 'M-S05', title: 'Detail laporan', path: '/laporan/:id', sample: '/laporan/5', element: <MS05ReportDetail />, login: true, std: NO_EMPTY,
    variants: [
      { key: 'triase_pending', label: 'Triase belum selesai' },
      { key: 'foto_tidak_tersedia', label: 'Foto tidak tersedia' },
      { key: 'self_verification', label: 'SELF_VERIFICATION' },
    ],
  },
  {
    id: 'M-S06', title: 'Moderasi (Laporan / Bukti)', path: '/moderasi', sample: '/moderasi', element: <MS06Moderation />, personas: ['moderator', 'admin'],
    variants: [{ key: 'self_verification', label: 'SELF_VERIFICATION (bukti)' }],
  },
  { id: 'M-S06', title: 'Bukti (tab moderator)', path: '/bukti', sample: '/bukti', element: <MS06Moderation />, personas: ['moderator', 'admin'], variants: [{ key: 'self_verification', label: 'SELF_VERIFICATION' }] },
  {
    id: 'M-S06', title: 'Detail moderasi', path: '/moderasi/:id', sample: '/moderasi/1', element: <MS06ModerationDetail />, personas: ['moderator', 'admin'], std: NO_EMPTY,
    variants: [
      { key: 'triase_pending', label: 'Triase pending' },
      { key: 'mismatch', label: 'HANDLING_MISMATCH' },
      { key: 'invalid_transition', label: 'Sudah diproses' },
      { key: 'cek_foto', label: 'Cek foto (S04)' },
      { key: 'tanpa_rekomendasi', label: 'Tanpa rekomendasi' },
    ],
  },
  { id: 'M-S08', title: 'Rekomendasi', path: '/rekomendasi', sample: '/rekomendasi', element: <MS08Recommendations />, personas: ['koordinator'] },
  {
    id: 'M-S08', title: 'Rincian skor', path: '/rekomendasi/:id', sample: '/rekomendasi/1', element: <MS08ScoreDetail />, personas: ['koordinator'], std: NO_EMPTY,
    variants: [{ key: 'invalid_transition', label: 'Sudah diterima komunitas lain' }],
  },
  {
    id: 'M-S09', title: 'Buat aksi', path: '/aksi/baru', sample: '/aksi/baru?report=2', element: <MS09CreateAction />, personas: ['koordinator'], std: ['sukses'],
    variants: [
      { key: 'draf_memuat', label: 'Draf memuat' },
      { key: 'already_exists', label: 'ALREADY_EXISTS' },
    ],
  },
  { id: 'M-S10', title: 'Aksi Saya', path: '/aksi', sample: '/aksi', element: <MS10MyActions />, personas: ['relawan', 'koordinator'] },
  {
    id: 'M-S11', title: 'Detail aksi', path: '/aksi/:id', sample: '/aksi/4', element: <MS11ActionDetail />, login: true, std: NO_EMPTY,
    variants: [
      { key: 'garis_lurus', label: 'Rute garis lurus' },
      { key: 'izin_ditolak', label: 'Izin lokasi ditolak' },
      { key: 'kuota_penuh', label: 'TASK_QUOTA_FULL' },
      { key: 'evidence_required', label: 'EVIDENCE_REQUIRED' },
      { key: 'hindari_hambatan', label: 'Menghindari hambatan' },
    ],
  },
  { id: 'M-S12', title: 'Rujukan', path: '/rujukan', sample: '/rujukan', element: <MS12Referrals />, personas: ['warga', 'moderator', 'instansi', 'admin'] },
  {
    id: 'M-S12', title: 'Detail rujukan', path: '/rujukan/:id', sample: '/rujukan/1', element: <MS12ReferralDetail />, personas: ['warga', 'moderator', 'instansi', 'admin'], std: NO_EMPTY,
    variants: [{ key: 'evidence_required', label: 'EVIDENCE_REQUIRED' }],
  },
  { id: 'M-S13', title: 'Hambatan', path: '/hambatan', sample: '/hambatan', element: <MS13Obstacles />, personas: ['koordinator', 'moderator', 'instansi', 'admin'] },
  { id: 'M-S14', title: 'Dampak', path: '/dampak', sample: '/dampak', element: <MS14Impact /> },
  { id: 'M-S15', title: 'Tentang AI', path: '/tentang-ai', sample: '/tentang-ai', element: <MS15AboutAi />, std: ['sukses', 'galat'] },
  { id: 'M-S16', title: 'Notifikasi', path: '/notifikasi', sample: '/notifikasi', element: <MS16Notifications />, login: true },
  { id: 'M-S18', title: 'Bantuan', path: '/bantuan', sample: '/bantuan', element: <MS18Help />, std: ['sukses'], variants: [{ key: '429', label: '429 terlalu cepat' }] },
  {
    id: 'M-S19', title: 'Pengaturan server', path: '/pengaturan-server', sample: '/pengaturan-server', element: <MS19ServerSettings />, std: ['sukses'],
    variants: [{ key: 'tidak_terhubung', label: 'Tidak terhubung' }],
  },
  { id: 'M-S20', title: 'Cari rute', path: '/rute', sample: '/rute', element: <MS20RouteSearch />, std: ['sukses', 'memuat', 'galat'], variants: [{ key: 'izin_ditolak', label: 'Izin lokasi ditolak' }] },
  { id: 'M-S21', title: 'Hasil rute', path: '/rute/hasil', sample: '/rute/hasil?ke=Stasiun%20Tebet', element: <MS21RouteResult /> },
  { id: 'M-S22', title: 'Admin', path: '/admin/:section', sample: '/admin/pengguna', element: <MS22Admin />, personas: ['admin'] },
  { id: 'M0', title: 'Lainnya', path: '/lainnya', sample: '/lainnya', element: <M0More />, personas: LOGGED, std: ['sukses'] },
]

export const statesFor = (m?: ScreenMeta) => m?.std ?? STD
