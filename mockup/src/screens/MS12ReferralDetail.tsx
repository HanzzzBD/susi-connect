/**
 * M-S12 Rujukan instansi (detail) — UI-SPEC S12 + M: tombol "Salin draf" + "Buka <kanal>" membuka browser.
 * Aturan repo #9: tidak ada klaim integrasi; peringatan #1 selalu tampil.
 * Mockup tanpa jaringan: "Buka <kanal>" tidak benar-benar membuka tautan (hanya menampilkan URL).
 * Varian: evidence_required.
 */
import { Copy, Download, ExternalLink, TriangleExclamationPoint } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { Dialog } from '../components/Dialog'
import { PhotoPicker, type PickedPhoto } from '../components/ReportInputs'
import { StdStates } from '../components/StateViews'
import { StatusChip } from '../components/StatusChip'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Input'
import { agencyById } from '../data/agencies'
import { buildDraft, referralById } from '../data/referrals'
import { reportById } from '../data/reports'
import type { ReferralStatus } from '../lib/labels'
import NotFound from './system/NotFound'

export default function MS12ReferralDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { screenState, persona, showToast } = useMock()
  const referral = referralById(Number(id))
  const report = referral ? reportById(referral.reportId) : undefined
  const [status, setStatus] = useState<ReferralStatus>(referral?.status ?? 'draf')
  const [draft, setDraft] = useState(referral && report ? buildDraft(report, referral) : '')
  const [ticket, setTicket] = useState(referral?.ticketNumber ?? '')
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [returning, setReturning] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnErr, setReturnErr] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!referral || !report) return <NotFound />
  const agency = agencyById(referral.agencyId)!
  const isOfficer = persona === 'moderator' || persona === 'instansi' || persona === 'admin'
  const hasHazard = report.triage.hazards.length > 0
  const draftLen = draft.trim().length

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(draft) // lokal, bukan request jaringan
    } catch {
      /* izin clipboard bisa ditolak browser — tetap tampilkan toast di mockup */
    }
    showToast('Draf disalin.')
  }
  const finish = () => {
    // Hanya origin instansi, butuh bukti `after` sah (E2/F4)
    if (screenState === 'evidence_required' || photos.length === 0) return setError('Perlu foto setelah ditangani yang sudah diverifikasi.')
    setError(null)
    showToast('Laporan ditandai selesai.')
  }
  const doReturn = () => {
    const n = returnReason.trim().length
    if (n < 5 || n > 300) return setReturnErr('Alasan 5–300 karakter') // [ASUMSI] teks validasi
    setReturning(false)
    showToast('Laporan dikembalikan dan direkomendasikan ke komunitas.')
    navigate('/rujukan')
  }

  return (
    <>
      <AppBar back title="Rujukan instansi" subtitle={`#${referral.id}`} />
      <ScreenBody>
        <StdStates state={screenState} shape="detail">
          {/* #1 Peringatan tetap */}
          <NoticeBox tone="amber" icon={<TriangleExclamationPoint size={16} />}>
            SUSI Connect tidak terhubung langsung ke instansi. Kirim lewat kanal resmi di bawah.
          </NoticeBox>

          <Card className="flex flex-col gap-1">
            <p className="text-sm font-bold text-ink">
              {report.title} <SyntheticMark />
            </p>
            <StatusChip kind="referral" value={status} />
          </Card>

          {/* #9 origin campuran */}
          {referral.origin === 'campuran' && <NoticeBox tone="blue">Laporan ini juga ditangani komunitas. Status laporan mengikuti aksi komunitas.</NoticeBox>}

          {/* #2 Kanal */}
          <Card className="flex flex-col gap-2">
            <CardTitle>{agency.name}</CardTitle>
            <p className="text-xs text-muted">{agency.note}</p>
            {agency.url ? (
              <Button variant="outline" icon={<ExternalLink size={16} />} onClick={() => showToast(`Mockup: tautan tidak dibuka (${agency.url}).`, 'info')}>
                Buka {agency.name}
              </Button>
            ) : (
              <p className="text-xs font-semibold text-ink-2">URL kanal [PERLU DIVERIFIKASI]</p>
            )}
          </Card>

          {/* #3 Draf */}
          <Card className="flex flex-col gap-2">
            <CardTitle right={<AiBadge source={referral.draftSource} />}>Draf</CardTitle>
            <TextArea aria-label="Draf" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={5000} className="min-h-56 text-xs" invalid={draftLen < 50} />
            {draftLen < 50 && <p className="text-xs font-semibold text-accent-red">Draf 50–5000 karakter</p>}
            {/* #4 */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" icon={<Copy size={16} />} className="py-3" onClick={copy}>
                Salin draf
              </Button>
              <Button variant="outline" icon={<Download size={16} />} onClick={() => showToast('Mockup: tidak ada file untuk diunduh.', 'info')}>
                Unduh foto lampiran
              </Button>
            </div>
          </Card>

          {/* #5 #6 */}
          <Card className="flex flex-col gap-3">
            <Field label="Nomor tiket dari kanal resmi (opsional)">{(fid) => <TextInput id={fid} maxLength={100} value={ticket} onChange={(e) => setTicket(e.target.value)} />}</Field>
            {status === 'draf' && (
              <Button variant="primary" onClick={() => { setStatus('terkirim'); showToast('Status rujukan diperbarui.') }}>
                Tandai sudah dikirim
              </Button>
            )}
            {isOfficer && status === 'terkirim' && (
              <Button variant="primary" onClick={() => { setStatus('ditindaklanjuti'); showToast('Status rujukan diperbarui.') }}>
                Tandai ditindaklanjuti
              </Button>
            )}
          </Card>

          {/* #7 #8 */}
          {isOfficer && (
            <Card className="flex flex-col gap-3">
              <PhotoPicker label="Foto setelah ditangani instansi" photos={photos} onChange={setPhotos} />
              {referral.origin === 'instansi' && (
                <Button variant="confirm" onClick={finish}>
                  Tandai laporan selesai
                </Button>
              )}
              {error && <NoticeBox tone="red">{error}</NoticeBox>}
            </Card>
          )}

          {/* #10 Moderator: kembalikan ke jalur komunitas */}
          {persona === 'moderator' && referral.origin === 'instansi' && status !== 'ditindaklanjuti' && (
            <div title={hasHazard ? 'Laporan berpenanda bahaya harus ditangani instansi' : undefined}>
              <Button variant="outline" disabled={hasHazard} onClick={() => setReturning(true)}>
                Kembalikan ke jalur komunitas
              </Button>
              {hasHazard && <p className="mt-1 text-xs text-white/80">Laporan berpenanda bahaya harus ditangani instansi</p>}
            </div>
          )}
        </StdStates>
      </ScreenBody>

      <Dialog open={returning} title="Kembalikan ke jalur komunitas" onClose={() => setReturning(false)} footer={<Button variant="primary" onClick={doReturn}>Kembalikan ke jalur komunitas</Button>}>
        <Field label="Alasan" error={returnErr}>
          {(fid, d) => <TextArea id={fid} aria-describedby={d} invalid={!!returnErr} maxLength={300} placeholder="Contoh: kelurahan meminta warga bergotong royong" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} />}
        </Field>
      </Dialog>
    </>
  )
}
