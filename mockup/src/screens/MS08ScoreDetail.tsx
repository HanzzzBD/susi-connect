/**
 * M-S08 detail — UI-SPEC S08 #4 ScoreBreakdown + #5 "Terima & buat aksi" / "Tolak".
 * Varian: invalid_transition ("Laporan ini sudah diterima komunitas lain.").
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { CategoryBadge } from '../components/CategoryBadge'
import { Dialog } from '../components/Dialog'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { StdStates } from '../components/StateViews'
import { StatusChip } from '../components/StatusChip'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, TextArea } from '../components/ui/Input'
import { matchById } from '../data/matches'
import { reportById } from '../data/reports'
import NotFound from './system/NotFound'

export default function MS08ScoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { screenState, showToast } = useMock()
  const match = matchById(Number(id))
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState<string | null>(null)
  if (!match) return <NotFound />
  const r = reportById(match.reportId)!
  const taken = screenState === 'invalid_transition'

  const accept = () => {
    if (taken) return showToast('Laporan ini sudah diterima komunitas lain.', 'error')
    showToast('Laporan diterima. Susun rencana aksinya.')
    navigate(`/aksi/baru?report=${r.id}`)
  }
  const reject = () => {
    const n = reason.trim().length
    if (n < 5 || n > 200) return setErr('Alasan 5–200 karakter') // [ASUMSI] teks validasi
    setRejecting(false)
    showToast('Tersimpan.') // [ASUMSI] teks sukses tolak match tidak ditentukan S08 — memakai teks umum S17
    navigate('/rekomendasi')
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppBar back title="Rincian skor" />
      <ScreenBody className="flex-1">
        <StdStates state={screenState} shape="detail">
          <Card className="flex flex-col gap-2">
            <p className="text-base font-bold text-ink">
              {r.title} <SyntheticMark />
            </p>
            <div className="flex flex-wrap gap-1">
              <CategoryBadge category={r.category} />
              <StatusChip kind="urgency" value={r.triage.urgency} />
              <StatusChip kind="match" value={match.status} />
            </div>
            <p className="text-xs text-muted">{r.kelurahan}</p>
          </Card>
          <MapPlaceholder className="h-32 rounded-2xl" points={[{ id: r.id, at: r.location, tone: 'blue', label: 'Lokasi laporan', shape: 'pin' }]} />
          {taken && <NoticeBox tone="red">Laporan ini sudah diterima komunitas lain.</NoticeBox>}
          <Card>
            <ScoreBreakdown breakdown={match.breakdown} total={match.score} />
          </Card>
        </StdStates>
      </ScreenBody>
      {match.status === 'diusulkan' && (
        <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-line bg-surface px-4 py-3">
          <Button variant="confirm" onClick={accept}>
            Terima &amp; buat aksi
          </Button>
          <Button variant="danger" onClick={() => setRejecting(true)}>
            Tolak
          </Button>
        </div>
      )}
      <Dialog
        open={rejecting}
        title="Tolak"
        onClose={() => setRejecting(false)}
        footer={
          <Button variant="danger" onClick={reject}>
            Tolak
          </Button>
        }
      >
        <Field label="Alasan" error={err}>
          {(fid, d) => (
            <TextArea id={fid} aria-describedby={d} invalid={!!err} maxLength={200} placeholder="Contoh: relawan kami sedang penuh minggu ini" value={reason} onChange={(e) => setReason(e.target.value)} />
          )}
        </Field>
      </Dialog>
    </div>
  )
}
