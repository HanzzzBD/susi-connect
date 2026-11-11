/**
 * Lencana status — resep DESIGN §7.3 "Lencana status": rounded-full px-2 py-0.5 bg-<warna>/15,
 * teks text-xs font-bold, ikon 12. Selalu ikon + teks (tidak hanya warna).
 * [ASUMSI] teks untuk nada oranye/kuning/hijau digelapkan agar kontras ≥ 4,5:1 (DESIGN §9), ikon tetap berwarna.
 */
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'
import {
  ACTION_STATUS_LABEL,
  EVIDENCE_STATUS_LABEL,
  MATCH_STATUS_LABEL,
  OBSTACLE_STATUS_LABEL,
  REFERRAL_STATUS_LABEL,
  REPORT_STATUS_LABEL,
  TASK_STATUS_LABEL,
  URGENCY_LABEL,
  type ActionStatus,
  type EvidenceStatus,
  type MatchStatus,
  type ObstacleStatus,
  type ReferralStatus,
  type ReportStatus,
  type TaskStatus,
  type Urgency,
} from '../lib/labels'
import {
  ACTION_STATUS_META,
  EVIDENCE_STATUS_META,
  MATCH_STATUS_META,
  OBSTACLE_STATUS_META,
  REFERRAL_STATUS_META,
  REPORT_STATUS_META,
  TASK_STATUS_META,
  URGENCY_META,
  type StatusMeta,
} from '../lib/statusMeta'
import { toneChip, toneIcon, type Tone } from '../theme/tokens'

export function Badge({ tone, icon: Icon, children, className }: { tone: Tone; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold', toneChip[tone], className)}>
      {Icon && <Icon size={12} strokeWidth={2.5} className={toneIcon[tone]} aria-hidden />}
      {children}
    </span>
  )
}

type Kind =
  | { kind: 'report'; value: ReportStatus }
  | { kind: 'action'; value: ActionStatus }
  | { kind: 'evidence'; value: EvidenceStatus }
  | { kind: 'obstacle'; value: ObstacleStatus }
  | { kind: 'task'; value: TaskStatus }
  | { kind: 'match'; value: MatchStatus }
  | { kind: 'referral'; value: ReferralStatus }
  | { kind: 'urgency'; value: Urgency }

function resolve(p: Kind): { meta: StatusMeta; label: string } {
  switch (p.kind) {
    case 'report':
      return { meta: REPORT_STATUS_META[p.value], label: REPORT_STATUS_LABEL[p.value] }
    case 'action':
      return { meta: ACTION_STATUS_META[p.value], label: ACTION_STATUS_LABEL[p.value] }
    case 'evidence':
      return { meta: EVIDENCE_STATUS_META[p.value], label: EVIDENCE_STATUS_LABEL[p.value] }
    case 'obstacle':
      return { meta: OBSTACLE_STATUS_META[p.value], label: OBSTACLE_STATUS_LABEL[p.value] }
    case 'task':
      return { meta: TASK_STATUS_META[p.value], label: TASK_STATUS_LABEL[p.value] }
    case 'match':
      return { meta: MATCH_STATUS_META[p.value], label: MATCH_STATUS_LABEL[p.value] }
    case 'referral':
      return { meta: REFERRAL_STATUS_META[p.value], label: REFERRAL_STATUS_LABEL[p.value] }
    case 'urgency':
      return { meta: URGENCY_META[p.value], label: `Urgensi ${URGENCY_LABEL[p.value].toLowerCase()}` }
  }
}

/** StatusBadge / UrgencyBadge / dsb. dalam satu komponen. */
export function StatusChip(props: Kind) {
  const { meta, label } = resolve(props)
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {label}
    </Badge>
  )
}
