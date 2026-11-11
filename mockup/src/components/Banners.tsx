/**
 * Banner & lencana informasi:
 * - FallbackBanner (UI-SPEC §0) & NetworkBanner hotspot (UI-SPEC M-S19) — resep "Banner jaringan cadangan" DESIGN §7.3.
 * - SyntheticBanner (S02 #4) & SyntheticMark "(sintetis)" — aturan repo #8.
 * - HazardBanner (S05 #2).
 */
import { FlaskConical, TriangleExclamationPoint, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'
import { HAZARD_LABEL, TEXT, type Hazard } from '../lib/labels'
import { cn } from '../lib/cn'
import { Badge } from './StatusChip'

export function NoticeBox({ tone = 'amber', icon, children, className }: { tone?: 'amber' | 'red' | 'green' | 'blue'; icon?: ReactNode; children: ReactNode; className?: string }) {
  const tones = {
    amber: 'bg-accent-orange/15 border-accent-orange/30',
    red: 'bg-accent-red/10 border-accent-red/30',
    green: 'bg-accent-green/15 border-accent-green/30',
    blue: 'bg-brand-blue/10 border-brand-blue/25',
  }
  // Dasar bg-surface agar warna transparan resep DESIGN §7.3 tetap terbaca di atas latar biru malam.
  return (
    <div role="status" className={cn('overflow-hidden rounded-xl bg-surface', className)}>
      <div className={cn('flex items-start gap-2 rounded-[inherit] border px-4 py-2.5 text-sm text-ink', tones[tone])}>
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

/** Mode cadangan (UI-SPEC §0). Kalimat pertama ditebalkan sesuai spesifikasi. */
export function FallbackBanner() {
  const [first, ...rest] = TEXT.fallbackBanner.split('. ')
  return (
    <div role="status" className="shrink-0 bg-accent-orange px-4 py-2 text-xs text-ink">
      <strong>{first}.</strong> {rest.join('. ')}
    </div>
  )
}

/** Banner jaringan cadangan hotspot — "kuning, di atas semua layar" (UI-SPEC M-S19). */
export function NetworkBanner() {
  return (
    <div role="status" className="flex shrink-0 items-start gap-2 bg-accent-orange px-4 py-2 text-xs text-ink">
      <Wifi size={14} className="mt-0.5 shrink-0" aria-hidden />
      <strong>{TEXT.hotspotBanner}</strong>
    </div>
  )
}

export function SyntheticBanner() {
  return (
    <NoticeBox tone="amber" icon={<FlaskConical size={16} className="text-ink-2" />}>
      {TEXT.syntheticBanner}
    </NoticeBox>
  )
}

/** Lencana "Data sintetis" (S05 #1). */
export function SyntheticBadge() {
  return (
    <Badge tone="amber" icon={FlaskConical}>
      {TEXT.syntheticBadge}
    </Badge>
  )
}

/** Penanda kecil "(sintetis)" di kartu daftar. */
export function SyntheticMark({ onDark }: { onDark?: boolean }) {
  return <span className={cn('text-xs', onDark ? 'text-white/70' : 'text-muted')}>(sintetis)</span>
}

export function HazardBanner({ hazards }: { hazards: Hazard[] }) {
  if (!hazards.length) return null
  const label = hazards.map((h) => HAZARD_LABEL[h]).join(', ')
  return (
    <NoticeBox tone="red" icon={<TriangleExclamationPoint size={16} className="text-accent-red" />}>
      Laporan ini mengandung indikasi bahaya ({label}). Jangan ditangani relawan tanpa petugas.
    </NoticeBox>
  )
}
