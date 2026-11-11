/**
 * Status → nada warna & ikon (DESIGN §2.3, nilai mobile §7.1).
 * Ikon Remix di DESIGN dipadankan ke lucide-react untuk mockup web [ASUMSI: di Expo memakai @expo/vector-icons].
 * Status tidak pernah hanya warna: selalu ikon + teks (UI-SPEC §0 Aksesibilitas).
 */
import type { LucideIcon } from 'lucide-react'
import {
  AlarmClock,
  ArrowDown,
  ArrowUp,
  Ban,
  CalendarDays,
  Check,
  CheckCheck,
  CircleExclamationPoint,
  CircleQuestionMark,
  CircleX,
  Clock,
  Hand,
  Hourglass,
  Landmark,
  ListChecks,
  Minus,
  Play,
  Sparkles,
  Timer,
  X,
} from 'lucide-react'
import type { Tone } from '../theme/tokens'
import type {
  ActionStatus,
  AiSource,
  EvidenceStatus,
  MatchStatus,
  ObstacleStatus,
  ReferralStatus,
  ReportStatus,
  TaskStatus,
  Urgency,
} from './labels'

export interface StatusMeta {
  tone: Tone
  icon: LucideIcon
}

export const REPORT_STATUS_META: Record<ReportStatus, StatusMeta> = {
  menunggu: { tone: 'neutral', icon: Clock },
  diverifikasi: { tone: 'ink', icon: Check },
  dikoordinasikan: { tone: 'ink', icon: Hand },
  diteruskan_instansi: { tone: 'blue', icon: Landmark },
  selesai: { tone: 'green', icon: CheckCheck },
  ditolak: { tone: 'red', icon: CircleX },
}

export const URGENCY_META: Record<Urgency, StatusMeta> = {
  rendah: { tone: 'green', icon: ArrowDown },
  sedang: { tone: 'amber', icon: Minus },
  tinggi: { tone: 'orange', icon: ArrowUp },
  darurat: { tone: 'red', icon: AlarmClock },
}

export const ACTION_STATUS_META: Record<ActionStatus, StatusMeta> = {
  direncanakan: { tone: 'neutral', icon: CalendarDays },
  berjalan: { tone: 'ink', icon: Play },
  menunggu_verifikasi: { tone: 'amber', icon: Hourglass },
  terverifikasi: { tone: 'green', icon: CheckCheck },
  dibatalkan: { tone: 'red', icon: X },
}

export const EVIDENCE_STATUS_META: Record<EvidenceStatus, StatusMeta> = {
  menunggu: { tone: 'amber', icon: Hourglass },
  sah: { tone: 'green', icon: Check },
  ditolak: { tone: 'red', icon: X },
}

export const OBSTACLE_STATUS_META: Record<ObstacleStatus, StatusMeta> = {
  aktif: { tone: 'orange', icon: CircleExclamationPoint },
  menunggu_konfirmasi: { tone: 'amber', icon: CircleQuestionMark },
  kedaluwarsa: { tone: 'neutral', icon: Timer },
  dicabut: { tone: 'neutral', icon: Ban },
}

/** [ASUMSI] DESIGN §2.3 tidak memetakan tugas/match/rujukan; dipilih nada netral yang paling dekat. */
export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  terbuka: { tone: 'blue', icon: Clock },
  diambil: { tone: 'neutral', icon: Check },
  selesai: { tone: 'green', icon: CheckCheck },
}
export const MATCH_STATUS_META: Record<MatchStatus, StatusMeta> = {
  diusulkan: { tone: 'neutral', icon: Clock },
  diterima: { tone: 'green', icon: Check },
  ditolak: { tone: 'red', icon: X },
  kedaluwarsa: { tone: 'neutral', icon: Timer },
}
export const REFERRAL_STATUS_META: Record<ReferralStatus, StatusMeta> = {
  draf: { tone: 'neutral', icon: Clock },
  terkirim: { tone: 'blue', icon: Landmark },
  ditindaklanjuti: { tone: 'green', icon: CheckCheck },
}

export const AI_SOURCE_META: Record<AiSource, StatusMeta> = {
  gemini: { tone: 'ai', icon: Sparkles },
  cache: { tone: 'ai', icon: Sparkles },
  aturan: { tone: 'neutral', icon: ListChecks },
}
