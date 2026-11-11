/** Toast — UI-SPEC §0 "Sukses aksi": toast hijau 4 dtk, role="status". */
import { useMock } from '../app/MockContext'
import { cn } from '../lib/cn'

export function ToastHost() {
  const { toast } = useMock()
  if (!toast) return null
  const tone = {
    success: 'bg-brand-green text-white',
    error: 'bg-surface text-accent-red border border-accent-red/40',
    info: 'bg-brand-blue text-white',
  }[toast.tone]
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-24 z-[60] flex justify-center">
      <div key={toast.id} role="status" aria-live="polite" className={cn('toast-in rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg', tone)}>
        {toast.text}
      </div>
    </div>
  )
}
