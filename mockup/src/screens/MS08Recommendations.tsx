/**
 * M-S08 Rekomendasi komunitas — UI-SPEC S08 + M: daftar kartu; rincian skor di layar detail.
 * Skor = rumus terbuka PRD §13 (bukan AI).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { SyntheticMark } from '../components/Banners'
import { CategoryBadge } from '../components/CategoryBadge'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { StatusChip } from '../components/StatusChip'
import { EmptyState, StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { communityById } from '../data/communities'
import { MATCHES } from '../data/matches'
import { reportById } from '../data/reports'
import { userById } from '../data/users'
import { formatDecimal, formatScore } from '../lib/format'
import type { MatchStatus } from '../lib/labels'

type Tab = Extract<MatchStatus, 'diusulkan' | 'diterima' | 'ditolak'>

export default function MS08Recommendations() {
  const { screenState, userId } = useMock()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('diusulkan')
  const [highFirst, setHighFirst] = useState(true)
  const communityId = userId ? userById(userId)?.communityId : undefined
  const community = communityId ? communityById(communityId) : undefined

  const list = (screenState === 'kosong' ? [] : MATCHES)
    .filter((m) => m.communityId === communityId && m.status === tab)
    .sort((a, b) => (highFirst ? b.score - a.score : a.score - b.score))

  return (
    <>
      <AppBar title={`Rekomendasi untuk ${community?.name ?? '—'}`} />
      <ScreenBody>
        <p className="text-sm text-white/80">Diurutkan dengan skor yang bisa dijelaskan: kategori, keahlian, wilayah, jarak, ketersediaan relawan.</p>
        <SegmentedTabs
          label="Status rekomendasi"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'diusulkan', label: 'Diusulkan' },
            { key: 'diterima', label: 'Diterima' },
            { key: 'ditolak', label: 'Ditolak' },
          ]}
        />
        <div className="flex gap-2">
          {/* [ASUMSI] label urut: UI-SPEC hanya menyebut "urut skor tertinggi/terendah" */}
          <Chip onDark active={highFirst} onClick={() => setHighFirst(true)}>
            Skor tertinggi
          </Chip>
          <Chip onDark active={!highFirst} onClick={() => setHighFirst(false)}>
            Skor terendah
          </Chip>
        </div>
        <StdStates state={screenState}>
          {list.length === 0 ? (
            <EmptyState text="Belum ada laporan yang cocok untuk komunitasmu." />
          ) : (
            list.map((m) => {
              const r = reportById(m.reportId)!
              return (
                <Card key={m.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-ink">
                      {r.title} <SyntheticMark />
                    </p>
                    <span className="rounded-xl bg-brand-blue/10 px-2.5 py-1 text-lg font-bold tabular-nums text-brand-blue" aria-label={`Skor ${formatScore(m.score)}`}>
                      {formatScore(m.score)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <CategoryBadge category={r.category} />
                    <StatusChip kind="urgency" value={r.triage.urgency} />
                  </div>
                  <p className="text-xs text-muted">
                    {r.kelurahan} · {formatDecimal(m.breakdown.distanceKm, 1)} km
                  </p>
                  <Button variant="outline" onClick={() => navigate(`/rekomendasi/${m.id}`)}>
                    Lihat rincian skor
                  </Button>
                </Card>
              )
            })
          )}
        </StdStates>
      </ScreenBody>
    </>
  )
}
