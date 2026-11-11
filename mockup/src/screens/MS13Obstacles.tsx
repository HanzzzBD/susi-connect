/**
 * M-S13 Hambatan jalan — UI-SPEC S13 + M: tekan lama di peta untuk menaruh titik hambatan.
 * Panel: tab "Aktif" / "Menunggu konfirmasi", tombol "+ Tandai hambatan", "Cabut" (pembuat/moderator),
 * konfirmasi S01 "Masih ada?".
 * [ASUMSI] teks petunjuk "Tekan lama di peta untuk menaruh titik hambatan" tidak ada di UI-SPEC.
 */
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useMock } from '../app/MockContext'
import { AppBar } from '../components/AppBar'
import { BottomSheet } from '../components/BottomSheet'
import { NoticeBox } from '../components/Banners'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { ObstacleForm } from '../components/ObstacleForm'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { StatusChip } from '../components/StatusChip'
import { EmptyState, ErrorState, Skeleton } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { OBSTACLES, obstacleDisplayStatus } from '../data/obstacles'
import type { LatLng } from '../data/types'
import { formatShortDateTime } from '../lib/format'
import { OBSTACLE_TYPE_LABEL } from '../lib/labels'

export default function MS13Obstacles() {
  const { screenState, userId, persona, showToast } = useMock()
  const [tab, setTab] = useState<'aktif' | 'menunggu'>('aktif')
  const [formPoint, setFormPoint] = useState<LatLng | null | undefined>(undefined)
  const [removed, setRemoved] = useState<number[]>([])

  const all = screenState === 'kosong' ? [] : OBSTACLES.filter((o) => !removed.includes(o.id))
  const list = all.filter((o) => {
    const s = obstacleDisplayStatus(o)
    return tab === 'aktif' ? s === 'aktif' || s === 'kedaluwarsa' : s === 'menunggu_konfirmasi'
  })

  return (
    <div className="flex h-full flex-col">
      <AppBar title="Hambatan jalan" />
      {screenState === 'memuat' ? (
        <div className="px-4">
          <Skeleton shape="map" />
        </div>
      ) : screenState === 'galat' ? (
        <div className="px-4">
          <ErrorState />
        </div>
      ) : (
        <div className="relative flex-1">
          <MapPlaceholder
            className="absolute inset-0"
            onLongPress={(p) => setFormPoint(p)}
            circles={all
              .filter((o) => obstacleDisplayStatus(o) !== 'kedaluwarsa')
              .map((o) => ({ id: o.id, at: o.location, radiusM: o.radiusM, tone: o.status === 'aktif' ? 'orange' : 'amber', label: o.description }))}
            points={all.map((o) => ({ id: o.id, at: o.location, tone: obstacleDisplayStatus(o) === 'aktif' ? 'orange' : obstacleDisplayStatus(o) === 'kedaluwarsa' ? 'neutral' : 'amber', label: o.description, shape: 'square' }))}
          />
          <span className="pointer-events-none absolute inset-x-0 top-12 z-10 mx-auto w-fit rounded-full bg-surface/95 px-4 py-2.5 text-xs font-semibold text-ink shadow">Tekan lama di peta untuk menaruh titik hambatan</span>

          <BottomSheet
            title="Hambatan"
            header={
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl bg-night p-1">
                  <SegmentedTabs
                    label="Status hambatan"
                    value={tab}
                    onChange={setTab}
                    tabs={[
                      { key: 'aktif', label: 'Aktif' },
                      { key: 'menunggu', label: 'Menunggu konfirmasi' },
                    ]}
                  />
                </div>
                <Button variant="outline" icon={<Plus size={16} />} onClick={() => setFormPoint(null)} className="py-2.5">
                  Tandai hambatan
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-2">
              {list.length === 0 ? (
                <EmptyState text="Tidak ada hambatan aktif di area ini." />
              ) : (
                list.map((o) => {
                  const s = obstacleDisplayStatus(o)
                  const canRevoke = o.createdBy === userId || persona === 'moderator'
                  return (
                    <div key={o.id} className="flex flex-col gap-1.5 rounded-xl bg-surface-2 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-ink">{OBSTACLE_TYPE_LABEL[o.type]}</span>
                        <StatusChip kind="obstacle" value={s} />
                      </div>
                      <span className="text-sm text-ink-2">{o.description}</span>
                      <span className="text-xs text-muted">Berlaku sampai {formatShortDateTime(o.expiresAt)}</span>
                      {s === 'menunggu_konfirmasi' && (
                        <>
                          <span className="text-sm font-semibold text-ink">Masih ada?</span>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={() => setRemoved((r) => [...r, o.id])}>
                              Ya, masih
                            </Button>
                            <Button variant="outline" onClick={() => setRemoved((r) => [...r, o.id])}>
                              Sudah tidak ada
                            </Button>
                          </div>
                        </>
                      )}
                      {canRevoke && s !== 'kedaluwarsa' && (
                        <Button variant="danger" className="py-2" onClick={() => setRemoved((r) => [...r, o.id])}>
                          Cabut
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
              <NoticeBox tone="blue">Hambatan memengaruhi rute relawan. Hambatan kedaluwarsa otomatis tidak dipakai.</NoticeBox>
            </div>
          </BottomSheet>
        </div>
      )}

      {formPoint !== undefined && (
        <ObstacleForm
          open
          initialPoint={formPoint}
          onClose={() => setFormPoint(undefined)}
          onSaved={() => {
            setFormPoint(undefined)
            showToast('Hambatan disimpan. Rute yang melewati area ini akan dihitung ulang.')
          }}
        />
      )}
    </div>
  )
}
