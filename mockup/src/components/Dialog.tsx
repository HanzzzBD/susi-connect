/**
 * Modal — resep DESIGN §7.3 "Modal": latar buram + penutup; kartu
 * w-full max-w-[420px] max-h-[75%] bg-surface rounded-2xl border border-line.
 */
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Portal } from './Overlay'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Dialog({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <Portal>
      <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-5">
        <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 cursor-default bg-night/60 backdrop-blur-sm" />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative flex max-h-[75%] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <button type="button" aria-label="Tutup" onClick={onClose} className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted active:opacity-80">
              <X size={20} />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex flex-col gap-2 border-t border-line px-5 py-3">{footer}</div>}
        </div>
      </div>
    </Portal>
  )
}
