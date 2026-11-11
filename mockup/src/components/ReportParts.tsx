/**
 * Komponen laporan bersama: PhotoPlaceholder, PhotoGallery (galeri geser — UI-SPEC M-S04/M-S05),
 * StatusTimeline (S05 #7), BeforeAfter (S05 #10, S07, S11 #8), ReportCard (S04 #3), KeyValue.
 */
import { ImageOff, Image as ImageIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORY_LABEL, REPORT_STATUS_LABEL, TEXT, type Category, type EvidenceStatus } from '../lib/labels'
import { formatDateTime } from '../lib/format'
import type { Report, StatusHistoryItem } from '../data/types'
import { cn } from '../lib/cn'
import { CategoryBadge } from './CategoryBadge'
import { StatusChip } from './StatusChip'
import { Badge } from './StatusChip'
import { SyntheticMark } from './Banners'

/** Foto sintetis: kotak abu-abu (mockup tidak memuat foto). `unavailable` = state 401/404 UI-SPEC §0. */
export function PhotoPlaceholder({ alt, unavailable, className, caption }: { alt: string; unavailable?: boolean; className?: string; caption?: string }) {
  return (
    <div role="img" aria-label={unavailable ? TEXT.photoUnavailable : alt} className={cn('flex flex-col items-center justify-center gap-1 rounded-xl bg-line/70 text-muted', className)}>
      {unavailable ? <ImageOff size={22} aria-hidden /> : <ImageIcon size={22} aria-hidden />}
      <span className="px-2 text-center text-[11px]">{unavailable ? TEXT.photoUnavailable : (caption ?? 'Foto (sintetis)')}</span>
    </div>
  )
}

/** Alt foto dari kategori, mis. "Foto laporan sampah, Tebet Barat" (UI-SPEC §0). */
export const photoAlt = (category: Category, kelurahan: string) => `Foto laporan ${CATEGORY_LABEL[category].toLowerCase()}, ${kelurahan}`

export function PhotoGallery({ count, category, kelurahan, unavailable }: { count: number; category: Category; kelurahan: string; unavailable?: boolean }) {
  if (count === 0) return <PhotoPlaceholder alt="" unavailable className="h-40 w-full" />
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5" aria-label="Galeri foto, geser untuk melihat">
      {Array.from({ length: count }).map((_, i) => (
        <PhotoPlaceholder
          key={i}
          alt={photoAlt(category, kelurahan)}
          unavailable={unavailable}
          className="h-44 w-[85%] shrink-0 snap-center"
          caption={`Foto ${i + 1} dari ${count} (sintetis)`}
        />
      ))}
    </div>
  )
}

export function StatusTimeline({ items }: { items: StatusHistoryItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((h, i) => (
        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
          <span className="relative flex flex-col items-center">
            <span className="mt-1 h-3 w-3 rounded-full bg-brand-blue" />
            {i < items.length - 1 && <span className="w-0.5 flex-1 bg-line" />}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">{REPORT_STATUS_LABEL[h.status]}</span>
            <span className="text-xs text-muted">
              oleh {h.byRole} · {formatDateTime(h.at)}
            </span>
            {h.reason && <span className="text-xs text-ink-2">{h.reason}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function BeforeAfter({ status, beforeLabel = 'Sebelum', afterLabel = 'Sesudah', hasAfter = true }: { status?: EvidenceStatus; beforeLabel?: string; afterLabel?: string; hasAfter?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-2">{beforeLabel}</span>
          <PhotoPlaceholder alt={`Foto ${beforeLabel.toLowerCase()} (sintetis)`} className="h-28" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-2">{afterLabel}</span>
          {hasAfter ? <PhotoPlaceholder alt={`Foto ${afterLabel.toLowerCase()} (sintetis)`} className="h-28" /> : <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-line text-xs text-muted">—</div>}
        </div>
      </div>
      {status && (
        <div>
          <StatusChip kind="evidence" value={status} />
        </div>
      )}
    </div>
  )
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/70 py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-ink">{children}</span>
    </div>
  )
}

/** Kartu laporan (UI-SPEC S04 #3): judul, kategori, StatusBadge, kelurahan, tanggal, thumbnail, lencana bukti. */
export function ReportCard({ report, onClick, needsConfirmation, extra }: { report: Report; onClick: () => void; needsConfirmation?: boolean; extra?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80">
      <PhotoPlaceholder alt={photoAlt(report.category, report.kelurahan)} className="h-16 w-16 shrink-0" caption=" " />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="line-clamp-2 text-sm font-bold text-ink">
          {report.title} <SyntheticMark />
        </span>
        <span className="flex flex-wrap gap-1">
          <StatusChip kind="report" value={report.status} />
          <CategoryBadge category={report.category} />
        </span>
        <span className="text-xs text-muted">
          {report.kelurahan} · {formatDateTime(report.createdAt)}
        </span>
        {needsConfirmation && <Badge tone="amber">Perlu konfirmasi bukti</Badge>}
        {extra}
      </span>
    </button>
  )
}
