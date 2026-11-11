/** Saklar on/off (role="switch"). Aktif = brand-green. */
import { cn } from '../../lib/cn'

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"
    >
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
      <span className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-green' : 'bg-line')}>
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-6' : 'left-1',
          )}
        />
      </span>
    </button>
  )
}

/** Stepper angka (UI-SPEC S09 #7 "Jumlah relawan"). */
export function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const btn = 'min-h-11 min-w-11 cursor-pointer rounded-xl bg-surface-2 text-lg font-bold text-ink active:opacity-80 disabled:text-line'
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} aria-label="Kurangi" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="min-w-10 text-center text-lg font-bold text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label="Tambah" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  )
}
