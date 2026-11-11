/**
 * M-S05 Detail laporan — UI-SPEC S05 + M: layar penuh (bukan modal), galeri foto geser.
 * Varian: triase_pending, foto_tidak_tersedia, self_verification. `?baru=1` = baru dikirim (triase belum selesai).
 */
import { CircleCheckBig } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge, AiReason } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { HazardBanner, NoticeBox, SyntheticBadge } from '../components/Banners'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { BeforeAfter, KeyValue, PhotoGallery, StatusTimeline } from '../components/ReportParts'
import { StdStates } from '../components/StateViews'
import { StatusChip } from '../components/StatusChip'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, TextArea } from '../components/ui/Input'
import { actionById } from '../data/actions'
import { communityById } from '../data/communities'
import { EVIDENCES } from '../data/evidences'
import { referralById } from '../data/referrals'
import { reportById } from '../data/reports'
import { CATEGORY_LABEL, HANDLING_LABEL, REFERRAL_STATUS_LABEL, REJECT_REASON_LABEL, SKILL_LABEL, URGENCY_LABEL } from '../lib/labels'
import NotFound from './system/NotFound'

export default function MS05ReportDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { screenState, userId, persona, showToast } = useMock()
  const report = reportById(Number(id))
  const [confirmMode, setConfirmMode] = useState<'idle' | 'belum' | 'done'>('idle')
  const [reason, setReason] = useState('')
  const [reasonErr, setReasonErr] = useState<string | null>(null)

  if (!report) return <NotFound />

  const triagePending = screenState === 'triase_pending' || params.get('baru') === '1'
  const t = report.triage
  const action = report.actionId ? actionById(report.actionId) : undefined
  const referral = report.referralId ? referralById(report.referralId) : undefined
  const isReporter = report.reporterId === userId
  const pendingAfter = EVIDENCES.find((e) => e.reportId === report.id && e.kind === 'after' && e.status === 'menunggu')
  // Lokasi persis hanya untuk peran berhak (PRD §6 hak akses)
  const canSeeExact = isReporter || persona === 'moderator' || persona === 'admin' || persona === 'koordinator' || persona === 'relawan'

  const confirmYes = () => {
    if (screenState === 'self_verification') return showToast('Bukti ini kamu unggah sendiri, jadi perlu diperiksa orang lain.', 'error')
    setConfirmMode('done')
    showToast('Terima kasih. Laporanmu ditandai selesai.')
  }
  const sendNo = () => {
    const n = reason.trim().length
    // [ASUMSI] pesan validasi alasan (UI-SPEC: wajib 5–300) tidak ditentukan teksnya
    if (n < 5 || n > 300) return setReasonErr('Alasan 5–300 karakter')
    setReasonErr(null)
    setConfirmMode('done')
    showToast('Masukanmu dikirim ke koordinator.')
  }

  return (
    <>
      <AppBar back title="Detail laporan" subtitle={`#${report.id}`} />
      <ScreenBody>
        <StdStates state={screenState} shape="detail">
          {/* #1 Header */}
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">{report.title}</h2>
            <div className="flex flex-wrap gap-1">
              <StatusChip kind="report" value={report.status} />
              {!triagePending && <StatusChip kind="urgency" value={t.urgency} />}
              {report.isSynthetic && <SyntheticBadge />}
            </div>
          </Card>

          {report.status === 'selesai' && (
            <NoticeBox tone="green" icon={<CircleCheckBig size={16} className="text-brand-green" />}>
              Masalah ini sudah selesai dan buktinya diverifikasi.
            </NoticeBox>
          )}
          {/* #11 Alasan ditolak */}
          {report.status === 'ditolak' && report.rejectReason && (
            <NoticeBox tone="red">
              Laporan ditolak: {REJECT_REASON_LABEL[report.rejectReason]}. {report.rejectNote}
            </NoticeBox>
          )}
          {/* #2 HazardBanner */}
          {!triagePending && <HazardBanner hazards={t.hazards} />}

          {/* #3/#4 Panel triase */}
          <Card>
            <CardTitle right={!triagePending && <AiBadge source={t.source} />}>Label awal</CardTitle>
            {triagePending ? (
              <p className="text-sm text-muted" aria-live="polite">
                Sedang menyiapkan label awal…
              </p>
            ) : (
              <>
                <KeyValue label="Kategori">{CATEGORY_LABEL[t.category]}</KeyValue>
                <KeyValue label="Urgensi">{URGENCY_LABEL[t.urgency]}</KeyValue>
                <KeyValue label="Penanganan">{HANDLING_LABEL[t.handling]}</KeyValue>
                <KeyValue label="Keahlian">{t.skills.length ? t.skills.map((s) => SKILL_LABEL[s]).join(', ') : '—'}</KeyValue>
                {t.override && (
                  <p className="mt-2 text-xs font-semibold text-ink-2">
                    Diubah moderator: {t.override.field} {t.override.from} → {t.override.to}
                  </p>
                )}
                <AiReason reason={t.reason} confidence={t.confidence} />
              </>
            )}
          </Card>

          {/* #5 Deskripsi & foto */}
          <Card className="flex flex-col gap-3">
            <p className="text-sm text-ink">{report.description}</p>
            <PhotoGallery count={report.photoCount} category={report.category} kelurahan={report.kelurahan} unavailable={screenState === 'foto_tidak_tersedia'} />
            <p className="text-xs text-muted">
              {report.landmark ? `${report.landmark} · ` : ''}
              {report.kelurahan}, {report.kecamatan}
            </p>
          </Card>

          {/* #6 Peta kecil — lokasi persis untuk peran berhak */}
          {canSeeExact && <MapPlaceholder className="h-36 rounded-2xl" points={[{ id: report.id, at: report.location, tone: 'blue', label: 'Lokasi laporan', shape: 'pin' }]} />}

          {/* #10 BeforeAfter untuk pelapor */}
          {isReporter && pendingAfter && confirmMode !== 'done' && (
            <Card className="flex flex-col gap-3">
              <CardTitle>Apakah masalahnya sudah selesai?</CardTitle>
              <BeforeAfter status="menunggu" />
              {confirmMode === 'belum' ? (
                <>
                  <Field label="Alasan" error={reasonErr}>
                    {(fid, d) => <TextArea id={fid} aria-describedby={d} invalid={!!reasonErr} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />}
                  </Field>
                  <Button variant="primary" onClick={sendNo}>
                    Kirim
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="confirm" onClick={confirmYes}>
                    Ya, sudah selesai
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmMode('belum')}>
                    Belum, ada yang kurang
                  </Button>
                </>
              )}
            </Card>
          )}

          {/* #8 Kartu aksi */}
          {action && (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-ink">Ditangani oleh {communityById(action.communityId)?.name}</p>
              <StatusChip kind="action" value={action.status} />
              <Link to={`/aksi/${action.id}`} className="min-h-11 content-center text-sm font-bold text-brand-blue">
                Lihat aksi
              </Link>
            </Card>
          )}
          {/* #9 Kartu rujukan */}
          {referral && (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-ink">Rujukan instansi: {REFERRAL_STATUS_LABEL[referral.status]}</p>
              <Link to={`/rujukan/${referral.id}`} className="min-h-11 content-center text-sm font-bold text-brand-blue">
                Lihat draf
              </Link>
            </Card>
          )}

          {/* #7 StatusTimeline */}
          <Card>
            <CardTitle>Riwayat status</CardTitle>
            <StatusTimeline items={report.history} />
          </Card>
        </StdStates>
      </ScreenBody>
    </>
  )
}
