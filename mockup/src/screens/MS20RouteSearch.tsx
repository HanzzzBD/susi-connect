/**
 * M-S20 Cari rute (moda umum) — UI-SPEC M-S20: field "Dari" (GPS otomatis) dan "Ke" (pencarian lokasi;
 * offline memakai daftar halte V2), "Waktu berangkat", tombol "Cari rute"; rekomendasi cepat.
 * Dari detail aksi: `?ke=` mengisi "Ke" = lokasi aksi.
 * Varian: galat ("Layanan rute sedang tidak tersedia. Coba lagi sebentar.").
 * [PERLU DIVERIFIKASI] isi "rekomendasi cepat" tidak dirinci; dipakai lokasi aksi komunitas [ASUMSI].
 * Teks "Sekarang"/"Atur waktu" dari DepartureTimeField app SmartRoute.
 */
import { ArrowUpDown, LocateFixed, MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody, SectionLabel } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { usePermission } from '../components/ReportInputs'
import { Skeleton } from '../components/StateViews'
import { Button, IconButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Field, TextInput } from '../components/ui/Input'
import { ACTIONS } from '../data/actions'
import { OFFLINE_STOPS } from '../data/transit'

export default function MS20RouteSearch() {
  const { screenState, isFallback } = useMock()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState(params.get('ke') ?? '')
  const [timeMode, setTimeMode] = useState<'sekarang' | 'atur'>('sekarang')
  const [time, setTime] = useState('08:00')
  const [focusTo, setFocusTo] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { request, dialog } = usePermission()

  // "Dari" terisi GPS otomatis saat layar dibuka (setelah izin lokasi)
  useEffect(() => {
    request('lokasi', () => setFrom('Lokasi saya'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const suggestions = OFFLINE_STOPS.filter((s) => s.toLowerCase().includes(to.toLowerCase()))
  const search = () => {
    if (!from.trim() || !to.trim()) return setErr('Isi asal dan tujuan sebelum mencari rute.') // teks dari app SmartRoute
    setErr(null)
    navigate(`/rute/hasil?dari=${encodeURIComponent(from)}&ke=${encodeURIComponent(to)}`)
  }

  return (
    <>
      <AppBar title="Rute" />
      <ScreenBody>
        {screenState === 'memuat' ? (
          <Skeleton shape="form" />
        ) : (
          <>
            {screenState === 'galat' && <NoticeBox tone="red">Layanan rute sedang tidak tersedia. Coba lagi sebentar.</NoticeBox>}
            <Card className="flex flex-col gap-3">
              <Field label="Dari">
                {(id) => (
                  <div className="flex items-center gap-2">
                    <TextInput id={id} value={from} onChange={(e) => setFrom(e.target.value)} />
                    <IconButton label="Pakai lokasi saya" onClick={() => request('lokasi', () => setFrom('Lokasi saya'))}>
                      <LocateFixed size={18} />
                    </IconButton>
                  </div>
                )}
              </Field>
              <IconButton label="Tukar asal dan tujuan" className="self-center" onClick={() => { setFrom(to); setTo(from) }}>
                <ArrowUpDown size={18} />
              </IconButton>
              <Field label="Ke">
                {(id) => (
                  <div className="relative">
                    <TextInput id={id} value={to} onFocus={() => setFocusTo(true)} onBlur={() => window.setTimeout(() => setFocusTo(false), 150)} onChange={(e) => setTo(e.target.value)} />
                    {focusTo && (
                      <ul className="absolute inset-x-0 top-full z-10 mt-1 rounded-xl border border-line bg-surface shadow-lg">
                        {isFallback && <li className="px-3 pt-2 text-[11px] text-muted">Daftar halte offline</li>}
                        {suggestions.map((s) => (
                          <li key={s}>
                            <button type="button" onMouseDown={() => setTo(s)} className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-b border-line px-3 py-2 text-left text-sm text-ink last:border-0 active:bg-surface-2">
                              <MapPin size={14} className="text-muted" /> {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Waktu berangkat</span>
                <div className="flex gap-2">
                  <Chip active={timeMode === 'sekarang'} onClick={() => setTimeMode('sekarang')}>
                    Sekarang
                  </Chip>
                  <Chip active={timeMode === 'atur'} onClick={() => setTimeMode('atur')}>
                    Atur waktu
                  </Chip>
                </div>
                {timeMode === 'atur' && <TextInput type="time" aria-label="Jam berangkat" value={time} onChange={(e) => setTime(e.target.value)} />}
              </div>
              {err && <p className="text-xs font-semibold text-accent-red">{err}</p>}
              <Button variant="primary" icon={<Search size={18} />} onClick={search}>
                Cari rute
              </Button>
            </Card>

            <SectionLabel>Rekomendasi cepat</SectionLabel>
            {ACTIONS.filter((a) => a.status === 'direncanakan' || a.status === 'berjalan').map((a) => (
              <button key={a.id} type="button" onClick={() => setTo(`Lokasi aksi ${a.code}`)} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80">
                <span className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
                  <MapPin size={18} />
                </span>
                <span className="text-sm font-semibold text-ink">
                  {a.title} <SyntheticMark />
                </span>
              </button>
            ))}
          </>
        )}
        {dialog}
      </ScreenBody>
    </>
  )
}
