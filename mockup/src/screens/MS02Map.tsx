/**
 * M-S02 Peta — UI-SPEC S02 + M: peta layar penuh + bottom sheet (40%) berisi Ringkasan/daftar;
 * tombol mengambang "+ Lapor" (warga/relawan); konfirmasi hambatan S01 di sheet (S13 #5).
 * Lokasi publik dibulatkan 3 desimal (aturan repo #4). Login: marker laporan sendiri ditandai "Laporanmu".
 * [PERLU DIVERIFIKASI] isi "daftar" di sheet tidak dirinci UI-SPEC — dipakai daftar laporan sesuai filter.
 */
import { Info, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { BottomSheet } from '../components/BottomSheet'
import { NoticeBox, SyntheticBanner, SyntheticMark } from '../components/Banners'
import { CategoryBadge } from '../components/CategoryBadge'
import { MapPlaceholder, type MapPoint } from '../components/MapPlaceholder'
import { ObstacleForm } from '../components/ObstacleForm'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { Badge, StatusChip } from '../components/StatusChip'
import { EmptyState, ErrorState, Skeleton } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Chip, ChipRow } from '../components/ui/Chip'
import { METRICS } from '../data/metrics'
import { OBSTACLES, obstacleDisplayStatus } from '../data/obstacles'
import { REPORTS, roundPublic } from '../data/reports'
import type { Report } from '../data/types'
import { formatDateTime, formatPercent } from '../lib/format'
import { OBSTACLE_TYPE_LABEL, type ReportStatus } from '../lib/labels'
import { REPORT_STATUS_META } from '../lib/statusMeta'
import { cn } from '../lib/cn'

type Filter = 'semua' | 'menunggu' | 'penanganan' | 'selesai'
const FILTERS: { key: Filter; label: string; statuses?: ReportStatus[] }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: 'Menunggu', statuses: ['menunggu'] },
  // "Dalam penanganan" = diverifikasi, dikoordinasikan, diteruskan_instansi (UI-SPEC S02 #7)
  { key: 'penanganan', label: 'Dalam penanganan', statuses: ['diverifikasi', 'dikoordinasikan', 'diteruskan_instansi'] },
  { key: 'selesai', label: 'Selesai', statuses: ['selesai'] },
]

export default function MS02Map() {
  const { screenState, persona, userId, showToast } = useMock()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('semua')
  const [selected, setSelected] = useState<Report | null>(null)
  const [sheetTab, setSheetTab] = useState<'ringkasan' | 'konfirmasi'>('ringkasan')
  const [proposeOpen, setProposeOpen] = useState(false)
  const [confirmed, setConfirmed] = useState<number[]>([])

  const loggedIn = persona !== 'tamu'
  const empty = screenState === 'kosong'
  const statuses = FILTERS.find((f) => f.key === filter)!.statuses
  // Peta publik tidak menampilkan laporan ditolak [ASUMSI]
  const visible = empty ? [] : REPORTS.filter((r) => r.status !== 'ditolak' && (!statuses || statuses.includes(r.status)))
  const publicMetrics = METRICS.filter((m) => m.publicMetric)
  const pendingObstacles = OBSTACLES.filter((o) => obstacleDisplayStatus(o) === 'menunggu_konfirmasi' && !confirmed.includes(o.id))

  const points: MapPoint[] = visible.map((r) => ({
    id: r.id,
    at: { lat: roundPublic(r.location.lat), lng: roundPublic(r.location.lng) },
    tone: REPORT_STATUS_META[r.status].tone,
    label: `${r.title} — ${r.reporterId === userId ? 'Laporanmu' : r.kelurahan}`,
    pulse: r.status === 'menunggu',
    shape: loggedIn && r.reporterId === userId ? 'pin' : 'circle',
    onClick: () => setSelected(r),
  }))

  const onLapor = () => navigate(loggedIn ? '/lapor' : '/login?next=/lapor')

  if (screenState === 'memuat')
    return (
      <div className="p-4">
        <Skeleton shape="map" />
      </div>
    )
  if (screenState === 'galat')
    return (
      <div className="p-4">
        <ErrorState />
      </div>
    )

  return (
    <div className="relative h-full">
      <h1 className="sr-only">Peta</h1>
      <MapPlaceholder
        className="absolute inset-0"
        points={points}
        circles={OBSTACLES.filter((o) => obstacleDisplayStatus(o) !== 'kedaluwarsa').map((o) => ({
          id: o.id,
          at: o.location,
          radiusM: o.radiusM,
          tone: o.status === 'aktif' ? 'orange' : 'amber',
          label: o.description,
        }))}
        offlineBasemap={screenState === 'offline'}
      />

      {/* Filter status (#7) di atas panel */}
      <div className="absolute inset-x-0 top-12 z-10 px-4">
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {/* Popup marker: label kategori, status, kelurahan, tanggal */}
      {selected && (
        <div className="absolute inset-x-4 top-28 z-20 rounded-2xl border border-line bg-surface p-4 shadow-lg">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-ink">
              {selected.title} <SyntheticMark />
            </p>
            <button type="button" aria-label="Tutup" className="min-h-11 min-w-11 cursor-pointer text-muted" onClick={() => setSelected(null)}>
              ×
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            <CategoryBadge category={selected.category} />
            <StatusChip kind="report" value={selected.status} />
            {loggedIn && selected.reporterId === userId && <Badge tone="blue">Laporanmu</Badge>}
          </div>
          <p className="mt-2 text-xs text-muted">
            {selected.kelurahan} · {formatDateTime(selected.createdAt)}
          </p>
          {loggedIn && selected.reporterId === userId && (
            <Button variant="link" className="mt-1" onClick={() => navigate(`/laporan/${selected.id}`)}>
              Lihat laporan
            </Button>
          )}
        </div>
      )}

      {(persona === 'warga' || persona === 'relawan') && (
        <button
          type="button"
          onClick={onLapor}
          className="absolute bottom-[42%] right-4 z-20 inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-lg active:opacity-90"
        >
          <Plus size={18} aria-hidden /> Lapor
        </button>
      )}

      <BottomSheet
        title="Ringkasan"
        header={
          loggedIn ? (
            <div className="rounded-2xl bg-night p-1">
              <SegmentedTabs
                label="Panel peta"
                value={sheetTab}
                onChange={setSheetTab}
                tabs={[
                  { key: 'ringkasan', label: 'Ringkasan' },
                  { key: 'konfirmasi', label: 'Menunggu konfirmasi' },
                ]}
              />
            </div>
          ) : (
            <h2 className="text-base font-bold text-ink">Ringkasan</h2>
          )
        }
      >
        {sheetTab === 'ringkasan' || !loggedIn ? (
          <div className="flex flex-col gap-3">
            <p className="text-base font-bold text-ink">Masalah sekitar, diselesaikan bersama.</p>
            <Button variant="primary" onClick={onLapor}>
              Laporkan masalah
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {publicMetrics.map((m) => (
                <div key={m.key} className="flex flex-col gap-0.5 rounded-xl bg-surface-2 p-3" title={m.formula}>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    {m.label}
                    <Info size={12} aria-label={m.formula} />
                  </span>
                  <span className="text-2xl font-bold text-ink">
                    {m.value === null ? '—' : m.unit === 'rasio' ? formatPercent(m.value) : m.value}
                    {m.unit === 'jam' && <span className="text-sm font-semibold"> jam</span>}
                    {m.unit === 'kg' && <span className="text-sm font-semibold"> kg</span>}
                  </span>
                </div>
              ))}
            </div>
            <SyntheticBanner />
            <p className="text-xs text-muted">Lokasi di peta publik dibulatkan sekitar 100 meter untuk melindungi pelapor.</p>
            {visible.length === 0 ? (
              <EmptyState text="Belum ada laporan di area ini. Jadilah yang pertama melapor." />
            ) : (
              <ul className="flex flex-col">
                {visible.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => setSelected(r)} className="flex min-h-11 w-full cursor-pointer flex-col gap-1 border-b border-line py-3 text-left active:bg-surface-2">
                      <span className="text-sm font-semibold text-ink">
                        {r.title} <SyntheticMark />
                      </span>
                      <span className="flex flex-wrap items-center gap-1">
                        <StatusChip kind="report" value={r.status} />
                        <span className="text-xs text-muted">{r.kelurahan}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button variant="outline" icon={<Plus size={16} />} onClick={() => setProposeOpen(true)}>
              Usulkan hambatan
            </Button>
            {pendingObstacles.length === 0 ? (
              <EmptyState text="Tidak ada hambatan aktif di area ini." />
            ) : (
              pendingObstacles.map((o) => (
                <div key={o.id} className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-ink">{OBSTACLE_TYPE_LABEL[o.type]}</span>
                    <StatusChip kind="obstacle" value="menunggu_konfirmasi" />
                  </div>
                  <span className="text-sm text-ink-2">{o.description}</span>
                  <span className="text-sm font-semibold text-ink">Masih ada?</span>
                  <div className={cn('grid grid-cols-2 gap-2')}>
                    <Button variant="outline" onClick={() => setConfirmed((c) => [...c, o.id])}>
                      Ya, masih
                    </Button>
                    <Button variant="outline" onClick={() => setConfirmed((c) => [...c, o.id])}>
                      Sudah tidak ada
                    </Button>
                  </div>
                </div>
              ))
            )}
            <NoticeBox tone="blue">Hambatan memengaruhi rute relawan. Hambatan kedaluwarsa otomatis tidak dipakai.</NoticeBox>
          </div>
        )}
      </BottomSheet>

      {proposeOpen && (
        <ObstacleForm
          open
          title="Usulkan hambatan"
          initialPoint={null}
          onClose={() => setProposeOpen(false)}
          onSaved={() => {
            setProposeOpen(false)
            showToast('Hambatan disimpan. Rute yang melewati area ini akan dihitung ulang.')
          }}
        />
      )}
    </div>
  )
}
