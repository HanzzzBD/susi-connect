/**
 * M-S14 Dampak — UI-SPEC S14 + M: 4 KPI + ringkasan status; metrik lengkap di web.
 * Angka DIHITUNG dari data mock dengan rumus PRD §10 (data/metrics.ts) — semua sintetis.
 * Filter (login): Kecamatan (moderator/instansi terkunci), Dari, Sampai, Komunitas (koordinator),
 * saklar "Sertakan data sintetis". Mematikan saklar = tidak ada data (semua data mock sintetis).
 */
import { Info } from 'lucide-react'
import { useState } from 'react'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody, SectionLabel } from '../components/AppBar'
import { SyntheticBanner } from '../components/Banners'
import { EmptyState, StdStates } from '../components/StateViews'
import { StatusChip } from '../components/StatusChip'
import { Card } from '../components/ui/Card'
import { Field, Select, TextInput } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { AREAS } from '../data/areas'
import { COMMUNITIES } from '../data/communities'
import { IS_SYNTHETIC_SHARE, METRICS, REPORTS_BY_STATUS, type Metric } from '../data/metrics'
import { formatDecimal, formatPercent } from '../lib/format'
import { REPORT_STATUSES } from '../lib/labels'

const KPI_KEYS = ['reports_total', 'resolution_rate', 'volunteer_hours', 'waste_kg_est']

function KpiCard({ m }: { m: Metric }) {
  const [open, setOpen] = useState(false)
  const value =
    m.value === null ? '—' : m.unit === 'rasio' ? formatPercent(m.value) : Number.isInteger(m.value) ? String(m.value) : formatDecimal(m.value, 1)
  const unit = m.value === null ? '' : m.unit === 'jam' ? ' jam' : m.unit === 'kg' ? ' kg' : ''
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4">
      <span className="flex items-center justify-between gap-1 text-xs text-muted">
        {m.label}
        <button type="button" aria-label={`Rumus ${m.label}`} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="-m-2 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
          <Info size={14} />
        </button>
      </span>
      <span className="text-2xl font-bold text-ink" title={m.value === null ? 'Belum ada data untuk dihitung.' : undefined}>
        {value}
        <span className="text-sm font-semibold">{unit}</span>
      </span>
      {open && <span className="rounded-lg bg-surface-2 p-2 text-[11px] text-ink-2">{m.value === null ? 'Belum ada data untuk dihitung.' : m.formula}</span>}
    </div>
  )
}

export default function MS14Impact() {
  const { screenState, persona } = useMock()
  const loggedIn = persona !== 'tamu'
  const locked = persona === 'moderator' || persona === 'instansi'
  const [kec, setKec] = useState('Tebet')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [community, setCommunity] = useState('')
  const [includeSynthetic, setIncludeSynthetic] = useState(true)

  const noData = screenState === 'kosong' || !includeSynthetic
  const kpis = KPI_KEYS.map((k) => METRICS.find((m) => m.key === k)!)

  return (
    <>
      <AppBar title="Dampak" />
      <ScreenBody>
        {IS_SYNTHETIC_SHARE > 0 && !noData && <SyntheticBanner />}

        {loggedIn && (
          <Card className="flex flex-col gap-3">
            <Field label="Kecamatan">
              {(id) => (
                <Select id={id} value={kec} disabled={locked} onChange={(e) => setKec(e.target.value)}>
                  {AREAS.map((a) => (
                    <option key={a.kecamatan}>{a.kecamatan}</option>
                  ))}
                </Select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Dari">{(id) => <TextInput id={id} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />}</Field>
              <Field label="Sampai">{(id) => <TextInput id={id} type="date" value={to} onChange={(e) => setTo(e.target.value)} />}</Field>
            </div>
            {persona === 'koordinator' && (
              <Field label="Komunitas">
                {(id) => (
                  <Select id={id} value={community} onChange={(e) => setCommunity(e.target.value)}>
                    <option value="">—</option>
                    {COMMUNITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            <Toggle label="Sertakan data sintetis" checked={includeSynthetic} onChange={setIncludeSynthetic} />
          </Card>
        )}

        <StdStates state={screenState === 'kosong' ? 'sukses' : screenState} shape="kpi">
          {noData ? (
            <EmptyState text="Belum ada data pada filter ini." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {kpis.map((m) => (
                  <KpiCard key={m.key} m={m} />
                ))}
              </div>
              <SectionLabel>Ringkasan status</SectionLabel>
              <Card className="flex flex-col gap-2">
                {REPORT_STATUSES.map((s) => (
                  <div key={s} className="flex items-center justify-between">
                    <StatusChip kind="report" value={s} />
                    <span className="text-base font-bold tabular-nums text-ink">{REPORTS_BY_STATUS[s] ?? 0}</span>
                  </div>
                ))}
              </Card>
            </>
          )}
        </StdStates>
      </ScreenBody>
    </>
  )
}
