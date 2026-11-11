/**
 * Bukti before/after — PRD §12.5: A04 bukti before; A05 before + after `menunggu`; L06–L09 sah.
 * Catatan & waktu = [ASUMSI]. Foto tidak ada (placeholder abu-abu).
 */
import type { Evidence } from './types'
import { at } from './clock'

const syn = { isSynthetic: true as const }

export const EVIDENCES: Evidence[] = [
  { ...syn, id: 1, actionId: 4, reportId: 4, kind: 'before', status: 'menunggu', uploadedBy: 3, createdAt: at(0, -1) },
  { ...syn, id: 2, actionId: 5, reportId: 5, kind: 'before', status: 'menunggu', uploadedBy: 3, createdAt: at(-1, -2) },
  { ...syn, id: 3, actionId: 5, reportId: 5, kind: 'after', status: 'menunggu', uploadedBy: 3, note: 'Area sudah bersih, 45 kg diangkut ke TPS.', createdAt: at(-1) },
  ...[6, 7, 8, 9].map<Evidence>((id) => ({
    ...syn, id: 10 + id, actionId: id, reportId: id, kind: 'after', status: 'sah', uploadedBy: 11, createdAt: at(-17 + id),
  })),
]

export const evidencesForAction = (actionId: number) => EVIDENCES.filter((e) => e.actionId === actionId)
