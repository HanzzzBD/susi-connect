/**
 * Tab atas (mis. "Ceritakan" / "Formulir", "Laporan" / "Bukti", "Tugas" / "Rute" / "Bukti").
 * Di atas latar biru malam: segmen terang = aktif. role="tablist" untuk aksesibilitas.
 */
import { cn } from '../lib/cn'

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: readonly { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-2xl bg-white/10 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'min-h-11 flex-1 cursor-pointer rounded-xl px-2 text-sm font-semibold transition-colors',
            value === t.key ? 'bg-surface text-brand-blue' : 'text-white/80',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
