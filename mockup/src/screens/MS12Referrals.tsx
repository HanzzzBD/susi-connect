/**
 * M-S12 Rujukan instansi (daftar) — UI-SPEC S12 "Daftar /rujukan".
 * Warga hanya melihat rujukan laporannya sendiri (pelapor).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { SyntheticMark } from '../components/Banners'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { StatusChip } from '../components/StatusChip'
import { EmptyState, StdStates } from '../components/StateViews'
import { agencyById } from '../data/agencies'
import { REFERRALS } from '../data/referrals'
import { reportById } from '../data/reports'
import type { ReferralStatus } from '../lib/labels'

export default function MS12Referrals() {
  const { screenState, persona, userId } = useMock()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ReferralStatus>('draf')

  const list = (screenState === 'kosong' ? [] : REFERRALS)
    .filter((f) => f.status === tab)
    .filter((f) => persona !== 'warga' || reportById(f.reportId)?.reporterId === userId)

  return (
    <>
      <AppBar title="Rujukan instansi" />
      <ScreenBody>
        <SegmentedTabs
          label="Status rujukan"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'draf', label: 'Draf' },
            { key: 'terkirim', label: 'Terkirim' },
            { key: 'ditindaklanjuti', label: 'Ditindaklanjuti' },
          ]}
        />
        <StdStates state={screenState}>
          {list.length === 0 ? (
            <EmptyState text="Belum ada rujukan di wilayahmu." />
          ) : (
            list.map((f) => {
              const r = reportById(f.reportId)!
              return (
                <button key={f.id} type="button" onClick={() => navigate(`/rujukan/${f.id}`)} className="flex w-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80">
                  <span className="text-sm font-bold text-ink">
                    {r.title} <SyntheticMark />
                  </span>
                  <StatusChip kind="referral" value={f.status} />
                  <span className="text-xs text-muted">
                    {f.origin === 'instansi' ? 'Diteruskan' : 'Bersama aksi komunitas'} · {agencyById(f.agencyId)?.name}
                  </span>
                  <span className="text-xs text-muted">{f.ticketNumber ?? '—'}</span>
                </button>
              )
            })
          )}
        </StdStates>
      </ScreenBody>
    </>
  )
}
