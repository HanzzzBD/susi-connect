/**
 * Tipe data mock. Bentuknya mengikuti SDD §8.1 secara longgar (camelCase untuk mockup;
 * API asli memakai snake_case). Semua entitas membawa `isSynthetic: true` (aturan repo #8).
 */
import type {
  ActionStatus,
  AiSource,
  Category,
  EvidenceStatus,
  Handling,
  Hazard,
  MatchStatus,
  ObstacleStatus,
  ObstacleType,
  Persona,
  ReferralStatus,
  RejectReason,
  ReportStatus,
  Skill,
  TaskStatus,
  Urgency,
} from '../lib/labels'

interface Synthetic {
  isSynthetic: true
}

export interface LatLng {
  lat: number
  lng: number
}

export interface User extends Synthetic {
  id: number
  name: string
  email: string
  role: 'warga' | 'moderator' | 'instansi' | 'admin'
  persona: Persona
  scopeKecamatan?: string
  communityId?: number
  memberRole?: 'anggota' | 'koordinator'
  isAvailable?: boolean
  isDemo: boolean
}

export interface Community extends Synthetic {
  id: number
  name: string
  categories: (Category | 'umum')[]
  skills: Skill[]
  kecamatan: string
  kelurahan: string[]
  base: LatLng
  availableMembers: number
}

export interface Agency extends Synthetic {
  id: number
  name: string
  url: string | null
  categories: string
  kecamatan: string | null
  note: string
}

export interface Triage {
  status: 'done' | 'pending'
  source: AiSource
  category: Category
  urgency: Urgency
  handling: Handling
  hazards: Hazard[]
  skills: Skill[]
  estVolunteers: number | null
  reason: string
  confidence: number
  /** Koreksi moderator, mis. urgensi sedang → tinggi. */
  override?: { field: 'urgensi' | 'kategori' | 'penanganan'; from: string; to: string }
}

export interface StatusHistoryItem {
  status: ReportStatus
  byRole: string
  at: string
  reason?: string
}

export interface Report extends Synthetic {
  id: number
  code: string
  title: string
  description: string
  category: Category
  status: ReportStatus
  kelurahan: string
  kecamatan: string
  /** Lokasi persis — hanya untuk peran berhak. Peta publik memakai pembulatan 3 desimal. */
  location: LatLng
  landmark?: string
  since?: string
  createdAt: string
  reporterId: number
  photoCount: number
  triage: Triage
  history: StatusHistoryItem[]
  rejectReason?: RejectReason
  rejectNote?: string
  duplicateOf?: number
  /** Kandidat duplikat (S03): id laporan + jarak meter. */
  duplicateCandidates?: { reportId: number; distanceM: number }[]
  actionId?: number
  referralId?: number
}

export interface MatchBreakdown {
  K: number
  A: number
  W: number
  J: number
  T: number
  distanceKm: number
  available: number
  needed: number
  reasons: string[]
}

export interface Match extends Synthetic {
  id: number
  reportId: number
  communityId: number
  rank: number
  score: number
  status: MatchStatus
  breakdown: MatchBreakdown
  rejectNote?: string
}

export interface Task extends Synthetic {
  id: number
  title: string
  skill: Skill
  quota: number
  assigneeIds: number[]
  status: TaskStatus
  needsRoute: boolean
  checkedInIds: number[]
}

export interface Action extends Synthetic {
  id: number
  code: string
  reportId: number
  communityId: number
  title: string
  status: ActionStatus
  scheduledAt: string
  meetingPoint: { name: string; at: LatLng }
  dropoff?: { name: string; at: LatLng }
  volunteers: number
  tools: string[]
  safetyNotes: string[]
  tasks: Task[]
  /** Jam relawan & sampah — hanya untuk aksi yang diajukan/terverifikasi. */
  volunteerHours?: number
  wasteKg?: number
}

export interface Evidence extends Synthetic {
  id: number
  actionId?: number
  referralId?: number
  reportId: number
  kind: 'before' | 'after'
  status: EvidenceStatus
  uploadedBy: number
  note?: string
  createdAt: string
}

export interface Referral extends Synthetic {
  id: number
  reportId: number
  agencyId: number
  origin: 'instansi' | 'campuran'
  status: ReferralStatus
  draftSource: AiSource
  ticketNumber?: string
}

export interface Obstacle extends Synthetic {
  id: number
  code: string
  type: ObstacleType
  description: string
  location: LatLng
  radiusM: number
  status: Exclude<ObstacleStatus, 'kedaluwarsa'>
  createdAt: string
  expiresAt: string
  createdBy: number
  sourceRole: string
  confirmations: number
}

export interface NotificationItem extends Synthetic {
  id: number
  userPersona: Persona
  title: string
  body: string
  createdAt: string
  read: boolean
  link: string
}

export interface AiLog extends Synthetic {
  id: number
  at: string
  purpose: string
  source: AiSource
  status: 'ok' | 'fallback' | 'error'
  tokens: number | null
  latencyMs: number | null
  corrected: boolean
}
