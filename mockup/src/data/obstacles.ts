/**
 * Hambatan jalan — PRD §12.6 (H01–H04). Koordinat = [ASUMSI] di sekitar Tebet.
 */
import type { Obstacle } from './types'
import type { ObstacleStatus } from '../lib/labels'
import { at, NOW } from './clock'

const syn = { isSynthetic: true as const }

export const OBSTACLES: Obstacle[] = [
  {
    ...syn, id: 1, code: 'H01', type: 'perbaikan_jalan', description: 'Galian saluran Jl. Tebet Utara (sintetis)',
    location: { lat: -6.2248, lng: 106.8505 }, radiusM: 60, status: 'aktif', createdAt: at(-1), expiresAt: at(3),
    createdBy: 9, sourceRole: 'instansi', confirmations: 0,
  },
  {
    ...syn, id: 2, code: 'H02', type: 'kegiatan_warga', description: 'Hajatan tutup gang (sintetis)',
    location: { lat: -6.2362, lng: 106.8612 }, radiusM: 40, status: 'aktif', createdAt: at(-2), expiresAt: at(-1),
    createdBy: 4, sourceRole: 'koordinator', confirmations: 0,
  },
  {
    ...syn, id: 3, code: 'H03', type: 'demo', description: 'Aksi massa (sintetis)',
    location: { lat: -6.2246, lng: 106.8455 }, radiusM: 150, status: 'aktif', createdAt: at(0, -3), expiresAt: at(1),
    createdBy: 7, sourceRole: 'moderator', confirmations: 0,
  },
  {
    ...syn, id: 4, code: 'H04', type: 'banjir', description: 'Genangan setinggi betis (sintetis)',
    location: { lat: -6.2244, lng: 106.8646 }, radiusM: 80, status: 'menunggu_konfirmasi', createdAt: at(0, -6), expiresAt: at(2),
    createdBy: 1, sourceRole: 'warga', confirmations: 1,
  },
]

/** Status tampilan: `kedaluwarsa` diturunkan dari expires_at (PRD §8.6). */
export function obstacleDisplayStatus(o: Obstacle): ObstacleStatus {
  if (o.status === 'aktif' && new Date(o.expiresAt) < NOW) return 'kedaluwarsa'
  return o.status
}
