/**
 * M-S10 Aksi saya — UI-SPEC S10.
 * [ASUMSI] pemetaan tab: Akan datang = direncanakan; Berjalan = berjalan + menunggu_verifikasi;
 * Selesai = terverifikasi + dibatalkan.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody, SectionLabel } from '../components/AppBar'
import { SyntheticMark } from '../components/Banners'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { Badge, StatusChip } from '../components/StatusChip'
import { EmptyState, StdStates } from '../components/StateViews'
import { Card } from '../components/ui/Card'
import { Toggle } from '../components/ui/Toggle'
import { ACTIONS } from '../data/actions'
import { communityById } from '../data/communities'
import { reportById } from '../data/reports'
import type { Action } from '../data/types'
import { userById } from '../data/users'
import { formatDateTime } from '../lib/format'
import type { ActionStatus } from '../lib/labels'

type Tab = 'akan' | 'berjalan' | 'selesai'
const TAB_STATUS: Record<Tab, ActionStatus[]> = {
  akan: ['direncanakan'],
  berjalan: ['berjalan', 'menunggu_verifikasi'],
  selesai: ['terverifikasi', 'dibatalkan'],
}

export default function MS10MyActions() {
  const { screenState, userId } = useMock()
  const navigate = useNavigate()
  const user = userId ? userById(userId) : undefined
  const [tab, setTab] = useState<Tab>('akan')
  const [available, setAvailable] = useState(user?.isAvailable ?? false)

  const isMine = (a: Action) =>
    a.tasks.some((t) => t.assigneeIds.includes(userId ?? -1)) || (user?.memberRole === 'koordinator' && a.communityId === user.communityId)
  const all = screenState === 'kosong' ? [] : ACTIONS
  const mine = all.filter((a) => isMine(a) && TAB_STATUS[tab].includes(a.status))
  // X2 scope=community dengan open_tasks > 0
  const needVolunteers = all.filter((a) => a.communityId === user?.communityId && a.tasks.some((t) => t.status === 'terbuka') && !a.tasks.some((t) => t.assigneeIds.includes(userId ?? -1)))

  const card = (a: Action) => {
    const r = reportById(a.reportId)!
    const open = a.tasks.filter((t) => t.status === 'terbuka').length
    const taken = a.tasks.some((t) => t.assigneeIds.includes(userId ?? -1))
    return (
      <button key={a.id} type="button" onClick={() => navigate(`/aksi/${a.id}`)} className="flex w-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80">
        <span className="text-sm font-bold text-ink">
          {a.title} <SyntheticMark />
        </span>
        <span className="flex flex-wrap gap-1">
          <StatusChip kind="action" value={a.status} />
          {taken && <Badge tone="blue">Tugasmu</Badge>}
        </span>
        <span className="text-xs text-muted">
          {communityById(a.communityId)?.name} · {formatDateTime(a.scheduledAt)} · {r.kelurahan}
        </span>
        <span className="text-xs font-semibold text-ink-2">{open} tugas terbuka</span>
      </button>
    )
  }

  return (
    <>
      <AppBar title="Aksi Saya" />
      <ScreenBody>
        <Card>
          <Toggle label="Saya siap ikut aksi minggu ini" checked={available} onChange={setAvailable} />
        </Card>
        <SegmentedTabs
          label="Status aksi"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'akan', label: 'Akan datang' },
            { key: 'berjalan', label: 'Berjalan' },
            { key: 'selesai', label: 'Selesai' },
          ]}
        />
        <StdStates state={screenState}>
          {mine.length === 0 ? <EmptyState text="Belum ada aksi. Cek bagian aksi komunitasmu yang butuh relawan." /> : mine.map(card)}
          <SectionLabel>Aksi komunitasmu yang butuh relawan</SectionLabel>
          {needVolunteers.length === 0 ? <EmptyState text="Belum ada data." /> : needVolunteers.map(card)}
        </StdStates>
      </ScreenBody>
    </>
  )
}
