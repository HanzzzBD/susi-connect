/**
 * M-S21 Hasil, perbandingan, detail & navigasi rute — UI-SPEC M-S21: tab Terbaik/Termurah/Tercepat/Ternyaman,
 * ComparisonCard, detail ruas; setiap waktu & tarif berlabel "perkiraan" + sumber ("jadwal GTFS",
 * "tarif resmi per <tanggal>"). Judul "Hasil Rute" & poin ComparisonCard dari app SmartRoute.
 * Data sintetis (data/transit.ts). Tarif = "—" (belum ada sumber, aturan repo #8).
 * [PERLU DIVERIFIKASI] poin ComparisonCard ("Lebih cepat/lancar/murah") adalah klaim app lama tanpa sumber.
 * Navigasi belokan-demi-belokan app SmartRoute TIDAK dibuat di mockup.
 */
import { Bus, CircleCheck, CircleX, Footprints, TrainFront } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { SyntheticBanner } from '../components/Banners'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { EmptyState, StdStates } from '../components/StateViews'
import { Card } from '../components/ui/Card'
import { sortTransit, TRANSIT_TABS, type TransitLeg, type TransitTab } from '../data/transit'

const LEG_ICON = { jalan: Footprints, krl: TrainFront, transjakarta: Bus, mikrotrans: Bus } as const

export default function MS21RouteResult() {
  const { screenState } = useMock()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<TransitTab>('Terbaik')
  const [open, setOpen] = useState<number | null>(null)
  const options = screenState === 'kosong' ? [] : sortTransit(tab)

  return (
    <>
      <AppBar back title="Hasil Rute" subtitle={`${params.get('dari') ?? 'Lokasi saya'} → ${params.get('ke') ?? '—'}`} />
      <ScreenBody>
        <SegmentedTabs label="Urutan rute" value={tab} onChange={setTab} tabs={TRANSIT_TABS.map((t) => ({ key: t, label: t }))} />
        <SyntheticBanner />
        <StdStates state={screenState === 'galat' ? 'galat' : screenState === 'memuat' ? 'memuat' : 'sukses'}>
          {options.length === 0 ? (
            <EmptyState text="Tidak ada rute yang ditemukan untuk perjalanan ini." />
          ) : (
            options.map((o) => (
              <Card key={o.id} className="flex flex-col gap-2">
                <button type="button" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full cursor-pointer flex-col gap-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-ink">± {o.totalMinutes} menit</span>
                    <span className="text-sm font-semibold text-ink-2">Tarif: —</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-ink-2">
                    {o.legs.map((l, i) => {
                      const Icon = LEG_ICON[l.mode]
                      return (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1">
                          <Icon size={12} aria-hidden /> {l.label}
                        </span>
                      )
                    })}
                  </div>
                  <span className="text-[11px] text-muted">Waktu: perkiraan, jadwal GTFS · Tarif: perkiraan, tarif resmi per [PERLU DIVERIFIKASI]</span>
                </button>
                {open === o.id && <LegList legs={o.legs} />}
              </Card>
            ))
          )}
        </StdStates>

        <Card className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3">
            <span className="text-sm font-bold text-ink">Transportasi Umum</span>
            {['Lebih cepat', 'Lebih lancar', 'Lebih murah'].map((p) => (
              <span key={p} className="flex items-center gap-1 text-xs text-ink">
                <CircleCheck size={14} className="text-accent-green" aria-hidden /> {p}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3">
            <span className="text-sm font-bold text-ink">Kendaraan Pribadi</span>
            {['Lebih lambat', 'Lebih macet', 'Lebih mahal'].map((p) => (
              <span key={p} className="flex items-center gap-1 text-xs text-ink">
                <CircleX size={14} className="text-accent-red" aria-hidden /> {p}
              </span>
            ))}
          </div>
        </Card>
      </ScreenBody>
    </>
  )
}

function LegList({ legs }: { legs: TransitLeg[] }) {
  return (
    <ol className="flex flex-col border-t border-line pt-2">
      {legs.map((l, i) => {
        const Icon = LEG_ICON[l.mode]
        return (
          <li key={i} className="flex items-start gap-3 py-1.5">
            <span className="rounded-full bg-brand-blue/10 p-1.5 text-brand-blue">
              <Icon size={14} aria-hidden />
            </span>
            <span className="flex flex-col text-sm">
              <span className="font-semibold text-ink">
                {l.label} · ± {l.minutes} menit (perkiraan)
              </span>
              <span className="text-xs text-muted">
                {l.from} → {l.to}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
