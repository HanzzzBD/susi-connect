/**
 * Rujukan instansi — PRD §12.5: L11 rujukan `draf` ke SP4N-LAPOR!; L12 `origin='campuran'` draf.
 * Teks draf dibangun dari templat struktur AI-PROMPTS §5.1 (sama dengan jalur fallback §7.5):
 * kronologi = deskripsi warga apa adanya. Bukan keluaran Gemini sungguhan.
 */
import type { Referral, Report } from './types'
import { CATEGORY_LABEL } from '../lib/labels'
import { formatDateTime } from '../lib/format'

const syn = { isSynthetic: true as const }

export const REFERRALS: Referral[] = [
  { ...syn, id: 1, reportId: 11, agencyId: 1, origin: 'instansi', status: 'draf', draftSource: 'gemini' },
  { ...syn, id: 2, reportId: 12, agencyId: 1, origin: 'campuran', status: 'draf', draftSource: 'aturan' },
]

export const referralById = (id: number) => REFERRALS.find((r) => r.id === id)

export function buildDraft(report: Report, referral: Referral): string {
  const coord = `${report.location.lat.toFixed(5)}, ${report.location.lng.toFixed(5)}`
  const request =
    referral.origin === 'campuran'
      ? 'Sebagian pekerjaan sudah ditangani komunitas warga. Kami memohon tindak lanjut untuk bagian yang menjadi kewenangan instansi.'
      : `Mohon tindak lanjut atas masalah ${CATEGORY_LABEL[report.category].toLowerCase()} ini oleh instansi berwenang.`
  return [
    `Judul: ${report.title}`,
    `Lokasi: ${report.landmark ?? '-'}, Kel. ${report.kelurahan}, Kec. ${report.kecamatan}, DKI Jakarta. Koordinat: ${coord}`,
    `Waktu laporan: ${formatDateTime(report.createdAt)}`,
    `Kronologi: ${report.description}`,
    // [ASUMSI] kalimat dampak generik templat fallback (AI-PROMPTS §7.5 tidak merinci isinya)
    'Dampak bagi warga: Mengganggu dan berisiko bagi warga sekitar.',
    `Permintaan tindak lanjut: ${request}`,
    `Lampiran: ${report.photoCount} foto (terlampir)`,
  ].join('\n')
}
