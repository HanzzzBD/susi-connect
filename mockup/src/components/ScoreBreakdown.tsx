/**
 * Rincian skor match — UI-SPEC S08 #4: tabel Komponen · Nilai · Bobot · Kontribusi
 * (mis. "Kategori · 1,0 · 0,35 · 0,35") + kalimat `reasons` digabung " · ".
 * Rumus terbuka PRD §13 — bukan keluaran AI.
 */
import { MATCH_WEIGHTS } from '../data/matches'
import type { MatchBreakdown } from '../data/types'
import { formatDecimal } from '../lib/format'

/** Nilai komponen: minimal `min` desimal, sampai 3 desimal (mis. 1,0 · 0,375; kontribusi 0,35 · 0,138). */
const fmt = (v: number, min = 1) => {
  const s = String(+v.toFixed(3))
  const decimals = s.includes('.') ? s.split('.')[1].length : 0
  return formatDecimal(v, Math.max(min, decimals))
}

export function ScoreBreakdown({ breakdown, total }: { breakdown: MatchBreakdown; total: number }) {
  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-2 font-semibold">Komponen</th>
            <th className="py-2 text-right font-semibold">Nilai</th>
            <th className="py-2 text-right font-semibold">Bobot</th>
            <th className="py-2 text-right font-semibold">Kontribusi</th>
          </tr>
        </thead>
        <tbody>
          {MATCH_WEIGHTS.map((w) => {
            const v = breakdown[w.key]
            return (
              <tr key={w.key} className="border-b border-line/60">
                <td className="py-2 text-ink">{w.label}</td>
                <td className="py-2 text-right tabular-nums text-ink">{fmt(v)}</td>
                <td className="py-2 text-right tabular-nums text-ink-2">{formatDecimal(w.weight, 2)}</td>
                <td className="py-2 text-right font-semibold tabular-nums text-ink">{fmt(v * w.weight, 2)}</td>
              </tr>
            )
          })}
          <tr>
            <td className="py-2 font-bold text-ink" colSpan={3}>
              Skor
            </td>
            <td className="py-2 text-right font-bold tabular-nums text-brand-blue">{formatDecimal(total, 3)}</td>
          </tr>
        </tbody>
      </table>
      <p className="rounded-xl bg-surface-2 p-3 text-xs text-ink-2">{breakdown.reasons.join(' · ')}</p>
    </div>
  )
}
