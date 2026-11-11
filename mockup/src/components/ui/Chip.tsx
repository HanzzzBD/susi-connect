/**
 * Chip pilihan (filter, tab ringan) dan chip input (alat). Aktif = brand-blue (tab aktif DESIGN §7.1).
 * Tinggi minimum 44 px untuk target sentuh.
 */
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  /** Varian di atas latar biru malam vs di dalam kartu terang. */
  onDark?: boolean
}

export function Chip({ active, onClick, children, onDark }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={cn(
        'inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-semibold active:opacity-80',
        active
          ? 'bg-brand-blue text-white'
          : onDark
            ? 'border border-white/20 bg-white/10 text-white'
            : 'border border-line bg-surface text-ink-2',
      )}
    >
      {children}
    </button>
  )
}

/** Chip input yang bisa dihapus (UI-SPEC S09 #8 "Alat yang dibawa"). */
export function RemovableChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line bg-surface-2 pl-3 text-sm text-ink">
      {children}
      <button
        type="button"
        aria-label={`Hapus ${String(children)}`}
        onClick={onRemove}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted active:opacity-80"
      >
        ×
      </button>
    </span>
  )
}

/** Baris chip yang bisa digulir horizontal. */
export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">{children}</div>
}
