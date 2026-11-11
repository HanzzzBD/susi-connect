/**
 * Bottom sheet di atas peta (UI-SPEC M-S02: tinggi 40%, bisa diperluas).
 * Pegangan sheet: resep DESIGN §7.3 (w-10 h-1 rounded-full bg-line self-center).
 */
import { useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export function BottomSheet({ children, header, title }: { children: ReactNode; header?: ReactNode; title: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section
      aria-label={title}
      className={cn(
        'absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl border-x border-t border-line bg-surface shadow-lg transition-[height] duration-200',
        expanded ? 'h-[85%]' : 'h-[40%]',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Perkecil panel' : 'Perbesar panel'}
        aria-expanded={expanded}
        className="flex min-h-8 w-full cursor-pointer items-center justify-center pt-2"
      >
        <span className="h-1 w-10 rounded-full bg-line" />
      </button>
      {header && <div className="px-4 pb-2">{header}</div>}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">{children}</div>
    </section>
  )
}
