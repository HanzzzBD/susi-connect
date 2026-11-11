/**
 * Metrik dampak (K1) — DIHITUNG dari data mock dengan rumus PRD §10, bukan angka karangan.
 * Metrik yang butuh tabel yang tidak dimodelkan di mockup (`ai_analyses`) bernilai null → "—".
 */
import type { ActionStatus, ReportStatus } from '../lib/labels'
import { ACTIONS } from './actions'
import { EVIDENCES } from './evidences'
import { MATCHES } from './matches'
import { REFERRALS } from './referrals'
import { REPORTS } from './reports'

export interface Metric {
  key: string
  label: string
  value: number | null
  unit: 'laporan' | 'rasio' | 'jam' | 'orang' | 'kg' | 'token'
  formula: string
  publicMetric?: boolean
}

const everIn = (status: ReportStatus) => REPORTS.filter((r) => r.history.some((h) => h.status === status))
const hoursBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000
const median = (xs: number[]) => {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const total = REPORTS.length
const rejected = REPORTS.filter((r) => r.status === 'ditolak').length
const done = REPORTS.filter((r) => r.status === 'selesai').length
const verifiedActions = ACTIONS.filter((a) => a.status === 'terverifikasi')
const decidedEvidence = EVIDENCES.filter((e) => e.status !== 'menunggu')
const rank1Decided = MATCHES.filter((m) => m.rank === 1 && (m.status === 'diterima' || m.status === 'ditolak'))
const geminiTriage = REPORTS.filter((r) => r.triage.source === 'gemini')

export const METRICS: Metric[] = [
  { key: 'reports_total', label: 'Laporan masuk', value: total, unit: 'laporan', formula: 'Jumlah laporan pada rentang waktu', publicMetric: true },
  { key: 'resolution_rate', label: 'Tingkat penyelesaian', value: done / (total - rejected), unit: 'rasio', formula: 'Laporan selesai ÷ (laporan masuk − ditolak)', publicMetric: true },
  {
    key: 'volunteer_hours', label: 'Jam relawan',
    value: verifiedActions.reduce((s, a) => s + (a.volunteerHours ?? 0), 0),
    unit: 'jam', formula: 'Jumlah jam penugasan pada aksi terverifikasi', publicMetric: true,
  },
  {
    key: 'waste_kg_est', label: 'Perkiraan sampah terangkut',
    value: verifiedActions.filter((a) => EVIDENCES.some((e) => e.actionId === a.id && e.status === 'sah')).reduce((s, a) => s + (a.wasteKg ?? 0), 0),
    unit: 'kg', formula: 'Jumlah volume_kg_est bukti sah; perkiraan koordinator', publicMetric: true,
  },
  { key: 'verification_rate', label: 'Tingkat verifikasi', value: everIn('diverifikasi').length / total, unit: 'rasio', formula: 'Laporan yang pernah diverifikasi ÷ laporan masuk' },
  {
    key: 'median_verify_hours', label: 'Median waktu verifikasi',
    value: median(everIn('diverifikasi').map((r) => hoursBetween(r.createdAt, r.history.find((h) => h.status === 'diverifikasi')!.at))),
    unit: 'jam', formula: 'Median (verified_at − created_at), jam',
  },
  {
    key: 'median_resolve_hours', label: 'Median waktu penyelesaian',
    value: median(REPORTS.filter((r) => r.status === 'selesai').map((r) => hoursBetween(r.createdAt, r.history.find((h) => h.status === 'selesai')!.at))),
    unit: 'jam', formula: 'Median (resolved_at − created_at) laporan selesai, jam',
  },
  { key: 'handled_by_community', label: 'Ditangani komunitas', value: everIn('dikoordinasikan').length, unit: 'laporan', formula: 'Laporan yang pernah dikoordinasikan' },
  { key: 'forwarded_to_agency', label: 'Diteruskan ke instansi', value: everIn('diteruskan_instansi').length, unit: 'laporan', formula: 'Laporan yang pernah diteruskan' },
  { key: 'mixed_with_agency_followup', label: 'Laporan campuran dengan rujukan', value: REFERRALS.filter((r) => r.origin === 'campuran').length, unit: 'laporan', formula: "Rujukan origin='campuran'" },
  {
    key: 'top_match_acceptance', label: 'Penerimaan rekomendasi teratas',
    value: rank1Decided.length ? rank1Decided.filter((m) => m.status === 'diterima').length / rank1Decided.length : null,
    unit: 'rasio', formula: 'Match peringkat 1 diterima ÷ match peringkat 1 yang diputuskan',
  },
  {
    key: 'unique_volunteers', label: 'Relawan terlibat',
    value: new Set(verifiedActions.flatMap((a) => a.tasks.flatMap((t) => t.assigneeIds))).size,
    unit: 'orang', formula: 'Jumlah relawan berbeda pada aksi terverifikasi',
  },
  {
    key: 'evidence_reject_rate', label: 'Tingkat bukti ditolak',
    value: decidedEvidence.length ? decidedEvidence.filter((e) => e.status === 'ditolak').length / decidedEvidence.length : null,
    unit: 'rasio', formula: 'Bukti ditolak ÷ bukti yang sudah diputuskan',
  },
  {
    key: 'triage_override_rate', label: 'Tingkat koreksi triase AI',
    value: geminiTriage.length ? geminiTriage.filter((r) => r.triage.override).length / geminiTriage.length : null,
    unit: 'rasio', formula: 'Triase Gemini yang dikoreksi ÷ triase Gemini',
  },
  // Butuh `ai_analyses` (tidak dimodelkan di mockup) → null, tampil "—"
  { key: 'ai_fallback_rate', label: 'Tingkat mode cadangan AI', value: null, unit: 'rasio', formula: 'Panggilan aturan/rekaman ÷ semua panggilan AI' },
  { key: 'ai_tokens_per_report', label: 'Token AI per laporan', value: null, unit: 'token', formula: '(token masuk + keluar) ÷ laporan masuk' },
  {
    key: 'safety_violations', label: 'Pelanggaran keselamatan (harus 0)',
    value: ACTIONS.filter((a) => REPORTS.find((r) => r.id === a.reportId)?.triage.hazards.length).length,
    unit: 'laporan', formula: 'Aksi dari laporan berpenanda bahaya',
  },
]

export const REPORTS_BY_STATUS = REPORTS.reduce(
  (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
  {} as Partial<Record<ReportStatus, number>>,
)
export const ACTIONS_BY_STATUS = ACTIONS.reduce(
  (acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }),
  {} as Partial<Record<ActionStatus, number>>,
)
export const OPEN_TASKS = ACTIONS.flatMap((a) => a.tasks).filter((t) => t.status === 'terbuka').length

/** Semua data mock sintetis → is_synthetic_share = 1,0. */
export const IS_SYNTHETIC_SHARE = 1
