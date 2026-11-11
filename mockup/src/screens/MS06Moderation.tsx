/**
 * M-S06 Moderasi — UI-SPEC S06 + S07 + M: tab atas "Laporan" / "Bukti"; detail di layar penuh.
 * Tab bawah moderator "Bukti" (M0) membuka layar yang sama dengan tab "Bukti" terpilih.
 * [PERLU DIVERIFIKASI] M0 memberi tab bawah "Bukti" padahal M-S06 sudah punya tab atas "Bukti" (duplikat jalur).
 * Varian: self_verification (bukti).
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { CategoryBadge } from '../components/CategoryBadge'
import { Dialog } from '../components/Dialog'
import { BeforeAfter } from '../components/ReportParts'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { Badge, StatusChip } from '../components/StatusChip'
import { EmptyState, StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, ChipRow } from '../components/ui/Chip'
import { Field, TextArea } from '../components/ui/Input'
import { actionById } from '../data/actions'
import { NOW } from '../data/clock'
import { communityById } from '../data/communities'
import { EVIDENCES } from '../data/evidences'
import { reportById, REPORTS } from '../data/reports'
import type { Evidence } from '../data/types'
import { formatRelative } from '../lib/format'
import type { ReportStatus } from '../lib/labels'

type Top = 'laporan' | 'bukti'
const QUEUE_TABS: { key: ReportStatus; label: (n: number) => string }[] = [
  { key: 'menunggu', label: (n) => `Menunggu (${n})` },
  { key: 'diverifikasi', label: () => 'Diverifikasi' },
  { key: 'diteruskan_instansi', label: () => 'Diteruskan' },
  { key: 'ditolak', label: () => 'Ditolak' },
]

export default function MS06Moderation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [top, setTop] = useState<Top>(location.pathname.startsWith('/bukti') ? 'bukti' : 'laporan')

  return (
    <>
      <AppBar title="Moderasi — Kecamatan Tebet" />
      <ScreenBody>
        <SegmentedTabs
          label="Moderasi"
          value={top}
          onChange={(v) => {
            setTop(v)
            navigate(v === 'bukti' ? '/bukti' : '/moderasi', { replace: true })
          }}
          tabs={[
            { key: 'laporan', label: 'Laporan' },
            { key: 'bukti', label: 'Bukti' },
          ]}
        />
        {top === 'laporan' ? <ReportQueue /> : <EvidenceQueue />}
      </ScreenBody>
    </>
  )
}

function ReportQueue() {
  const { screenState } = useMock()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ReportStatus>('menunggu')
  const [newestFirst, setNewestFirst] = useState(false)

  // Lingkup moderator(W): kecamatan Tebet
  const scope = screenState === 'kosong' ? [] : REPORTS.filter((r) => r.kecamatan === 'Tebet')
  const waiting = scope.filter((r) => r.status === 'menunggu').length
  const list = scope
    .filter((r) => r.status === tab)
    .sort((a, b) => (newestFirst ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)))

  return (
    <StdStates state={screenState}>
      <ChipRow>
        {QUEUE_TABS.map((t) => (
          <Chip key={t.key} onDark active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label(waiting)}
          </Chip>
        ))}
      </ChipRow>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Antrian Moderasi</h2>
        <div className="flex gap-1">
          <Chip onDark active={!newestFirst} onClick={() => setNewestFirst(false)}>
            Terlama
          </Chip>
          <Chip onDark active={newestFirst} onClick={() => setNewestFirst(true)}>
            Terbaru
          </Chip>
        </div>
      </div>
      {list.length === 0 ? (
        // Teks UI-SPEC hanya untuk antrian "Menunggu"; tab lain memakai "Belum ada data." (S17) [ASUMSI]
        <EmptyState text={tab === 'menunggu' ? 'Tidak ada laporan yang menunggu. Kerja bagus!' : 'Belum ada data.'} />
      ) : (
        list.map((r) => (
          <button key={r.id} type="button" onClick={() => navigate(`/moderasi/${r.id}`)} className="flex w-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80">
            <span className="text-sm font-bold text-ink">
              {r.title} <SyntheticMark />
            </span>
            <span className="flex flex-wrap gap-1">
              <CategoryBadge category={r.category} />
              {r.triage.status === 'done' && <StatusChip kind="urgency" value={r.triage.urgency} />}
              <AiBadge source={r.triage.source} />
              {r.duplicateCandidates?.length ? <Badge tone="amber">Kemungkinan duplikat ({r.duplicateCandidates.length})</Badge> : null}
            </span>
            <span className="text-xs text-muted">{formatRelative(r.createdAt, NOW)}</span>
          </button>
        ))
      )}
    </StdStates>
  )
}

/* ---------- S07 Verifikasi bukti ---------- */
function EvidenceQueue() {
  const { screenState, userId, showToast } = useMock()
  const [decided, setDecided] = useState<number[]>([])
  const [rejecting, setRejecting] = useState<Evidence | null>(null)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const items = screenState === 'kosong' ? [] : EVIDENCES.filter((e) => e.kind === 'after' && e.status === 'menunggu' && !decided.includes(e.id))

  const approve = (e: Evidence) => {
    if (screenState === 'self_verification' || e.uploadedBy === userId) return showToast('Kamu tidak bisa memverifikasi bukti yang kamu unggah sendiri.', 'error')
    setDecided((d) => [...d, e.id])
    showToast(`Bukti sah. Laporan #${e.reportId} selesai.`)
  }
  const reject = () => {
    const n = reason.trim().length
    if (n < 5 || n > 300) return setErr('Alasan 5–300 karakter') // [ASUMSI] teks validasi
    setDecided((d) => [...d, rejecting!.id])
    setRejecting(null)
    setReason('')
    setErr(null)
    showToast('Bukti ditolak.', 'info') // [ASUMSI] teks sukses tolak tidak ditentukan UI-SPEC S07
  }

  return (
    <StdStates state={screenState}>
      <h2 className="text-sm font-bold text-white">Verifikasi Bukti</h2>
      {items.length === 0 ? (
        <EmptyState text="Tidak ada bukti yang perlu diperiksa." />
      ) : (
        items.map((e) => {
          const r = reportById(e.reportId)!
          const a = e.actionId ? actionById(e.actionId) : undefined
          return (
            <Card key={e.id} className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-bold text-ink">
                  {r.title} <SyntheticMark />
                </p>
                {a && <p className="text-xs text-muted">{communityById(a.communityId)?.name}</p>}
              </div>
              <BeforeAfter status={e.status} />
              {e.note && <p className="text-sm text-ink-2">{e.note}</p>}
              <p className="text-xs text-muted">Diunggah oleh anggota komunitas</p>
              <Button variant="confirm" onClick={() => approve(e)}>
                Sah — masalah selesai
              </Button>
              <Button variant="danger" onClick={() => setRejecting(e)}>
                Tolak bukti
              </Button>
            </Card>
          )
        })
      )}
      {screenState === 'self_verification' && <NoticeBox tone="red">Kamu tidak bisa memverifikasi bukti yang kamu unggah sendiri.</NoticeBox>}
      <Dialog
        open={!!rejecting}
        title="Tolak bukti"
        onClose={() => setRejecting(null)}
        footer={
          <Button variant="danger" onClick={reject}>
            Tolak bukti
          </Button>
        }
      >
        <Field label="Alasan" error={err}>
          {(id, d) => (
            <TextArea id={id} aria-describedby={d} invalid={!!err} maxLength={300} placeholder="Contoh: foto after tidak menunjukkan lokasi yang sama" value={reason} onChange={(ev) => setReason(ev.target.value)} />
          )}
        </Field>
      </Dialog>
    </StdStates>
  )
}
