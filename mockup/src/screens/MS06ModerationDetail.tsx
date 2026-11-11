/**
 * M-S06 detail (layar penuh) — UI-SPEC S06 #4–#11; tombol aksi di bar bawah tetap (M).
 * Varian: triase_pending, mismatch (HANDLING_MISMATCH), invalid_transition, cek_foto (S04), tanpa_rekomendasi.
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge, AiReason } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { HazardBanner, NoticeBox, SyntheticBadge } from '../components/Banners'
import { Dialog } from '../components/Dialog'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PhotoGallery } from '../components/ReportParts'
import { StdStates } from '../components/StateViews'
import { Badge, StatusChip } from '../components/StatusChip'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Field, Select, TextArea, TextInput } from '../components/ui/Input'
import { AGENCIES } from '../data/agencies'
import { communityById } from '../data/communities'
import { MATCHES } from '../data/matches'
import { reportById } from '../data/reports'
import { formatDecimal } from '../lib/format'
import {
  CATEGORIES,
  CATEGORY_LABEL,
  HANDLINGS,
  HANDLING_LABEL,
  HAZARDS,
  HAZARD_LABEL,
  REJECT_REASONS,
  REJECT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  SKILLS,
  SKILL_LABEL,
  URGENCIES,
  URGENCY_LABEL,
  type Category,
  type Handling,
  type Hazard,
  type RejectReason,
  type Skill,
  type Urgency,
} from '../lib/labels'
import NotFound from './system/NotFound'

export default function MS06ModerationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { screenState, showToast } = useMock()
  const report = reportById(Number(id))

  const [cat, setCat] = useState<Category>(report?.triage.category ?? 'sampah')
  const [urg, setUrg] = useState<Urgency>(report?.triage.urgency ?? 'sedang')
  const [handling, setHandling] = useState<Handling>(report?.triage.handling ?? 'komunitas')
  const [hazards, setHazards] = useState<Hazard[]>(report?.triage.hazards ?? [])
  const [skills, setSkills] = useState<Skill[]>(report?.triage.skills ?? [])
  const [vol, setVol] = useState<number>(report?.triage.estVolunteers ?? 1)
  const [dialog, setDialog] = useState<'teruskan' | 'tolak' | null>(null)
  const [agency, setAgency] = useState('1')
  const [note, setNote] = useState('')
  const [rejectReason, setRejectReason] = useState<RejectReason>('palsu')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectErr, setRejectErr] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  if (!report) return <NotFound />

  const pending = screenState === 'triase_pending' || report.triage.status === 'pending'
  const canVerify = !pending && handling !== 'instansi' && hazards.length === 0
  const recs = screenState === 'tanpa_rekomendasi' ? [] : MATCHES.filter((m) => m.reportId === 2) // contoh hasil L02 (PRD §13)
  const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x])

  const doVerify = () => {
    if (screenState === 'invalid_transition') return showToast('Laporan ini sudah diproses moderator lain.', 'error')
    setVerified(true)
    showToast('Laporan diverifikasi. 3 komunitas diberi tahu.')
  }
  const doForward = () => {
    setDialog(null)
    showToast('Laporan diteruskan. Draf siap disalin.')
    navigate('/moderasi')
  }
  const doReject = () => {
    const n = rejectNote.trim().length
    if (n < 5 || n > 300) return setRejectErr('Catatan 5–300 karakter') // [ASUMSI] teks validasi
    setDialog(null)
    showToast('Laporan ditolak.')
    navigate('/moderasi')
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppBar back title="Detail laporan" subtitle={`#${report.id} · ${REPORT_STATUS_LABEL[report.status]}`} />
      <ScreenBody className="flex-1">
        <StdStates state={screenState} shape="detail">
          {/* #4 ringkasan S05 #1–#6 */}
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">{report.title}</h2>
            <div className="flex flex-wrap gap-1">
              <StatusChip kind="report" value={report.status} />
              {!pending && <StatusChip kind="urgency" value={report.triage.urgency} />}
              <SyntheticBadge />
            </div>
            <p className="text-sm text-ink">{report.description}</p>
            <PhotoGallery count={report.photoCount} category={report.category} kelurahan={report.kelurahan} />
          </Card>
          {!pending && <HazardBanner hazards={report.triage.hazards} />}
          <MapPlaceholder className="h-32 rounded-2xl" points={[{ id: report.id, at: report.location, tone: 'blue', label: 'Lokasi laporan', shape: 'pin' }]} />

          {screenState === 'invalid_transition' && <NoticeBox tone="red">Laporan ini sudah diproses moderator lain.</NoticeBox>}

          {/* #5 TriagePanel */}
          <Card className="flex flex-col gap-3">
            <CardTitle right={!pending && <AiBadge source={report.triage.source} />}>Label awal</CardTitle>
            {pending ? (
              <p className="text-sm text-muted">Menunggu label awal…</p>
            ) : (
              <>
                <AiReason reason={report.triage.reason} confidence={report.triage.confidence} />
                <Field label="Kategori">
                  {(fid) => (
                    <Select id={fid} value={cat} onChange={(e) => setCat(e.target.value as Category)}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABEL[c]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Urgensi">
                  {(fid) => (
                    <Select id={fid} value={urg} onChange={(e) => setUrg(e.target.value as Urgency)}>
                      {URGENCIES.map((u) => (
                        <option key={u} value={u}>
                          {URGENCY_LABEL[u]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Penanganan">
                  {(fid) => (
                    <Select id={fid} value={handling} onChange={(e) => setHandling(e.target.value as Handling)}>
                      {HANDLINGS.map((h) => (
                        <option key={h} value={h}>
                          {HANDLING_LABEL[h]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink-2">Penanda bahaya</span>
                  <div className="flex flex-wrap gap-1.5">
                    {HAZARDS.map((h) => (
                      <Chip key={h} active={hazards.includes(h)} onClick={() => setHazards(toggle(hazards, h))}>
                        {HAZARD_LABEL[h]}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink-2">Keahlian</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS.map((s) => (
                      <Chip key={s} active={skills.includes(s)} onClick={() => setSkills(toggle(skills, s))}>
                        {SKILL_LABEL[s]}
                      </Chip>
                    ))}
                  </div>
                </div>
                <Field label="Perkiraan relawan">
                  {(fid) => <TextInput id={fid} type="number" min={1} max={100} value={vol} onChange={(e) => setVol(Math.min(100, Math.max(1, +e.target.value)))} />}
                </Field>
                <p className="text-xs text-muted">Perubahanmu dicatat sebagai koreksi atas saran AI.</p>
              </>
            )}
          </Card>

          {/* #6 Kandidat duplikat (S03) */}
          {report.duplicateCandidates?.map((d) => {
            const dup = reportById(d.reportId)!
            return (
              <Card key={d.reportId} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">
                  #{dup.id} · {d.distanceM} m · {REPORT_STATUS_LABEL[dup.status].split(' ')[0]}
                </p>
                <Button variant="outline" onClick={() => { setRejectReason('duplikat'); setRejectNote(`Duplikat dari #${dup.id}`); setDialog('tolak') }}>
                  Tandai duplikat dari #{dup.id}
                </Button>
              </Card>
            )
          })}

          {/* #7 Cek foto (S04, bila aktif) */}
          {screenState === 'cek_foto' && (
            <Card className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink">Saran AI: foto sesuai kategori</span>
                <AiBadge source="gemini" />
              </div>
              <Badge tone="amber">Ada wajah/plat terlihat</Badge>
            </Card>
          )}

          {screenState === 'mismatch' && <NoticeBox tone="blue">Laporan ini perlu ditangani instansi. Gunakan Teruskan ke instansi.</NoticeBox>}

          {/* #11 Hasil verifikasi */}
          {verified && (
            <Card className="flex flex-col gap-2">
              <CardTitle>Hasil verifikasi</CardTitle>
              {recs.length === 0 ? (
                <p className="text-sm text-ink-2">Tidak ada komunitas yang cocok. Pertimbangkan meneruskan ke instansi.</p>
              ) : (
                recs.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                    <span className="text-sm text-ink">{communityById(m.communityId)?.name}</span>
                    <span className="text-sm font-bold tabular-nums text-brand-blue">{formatDecimal(m.score, 3)}</span>
                  </div>
                ))
              )}
            </Card>
          )}
        </StdStates>
      </ScreenBody>

      {/* Bar tombol bawah tetap (M-S06) — #8 Verifikasi, #9 Teruskan, #10 Tolak */}
      {!verified && (
        <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-line bg-surface px-4 py-3">
          {pending && <p className="text-center text-xs text-muted">Menunggu label awal…</p>}
          <Button variant="confirm" disabled={!canVerify} onClick={doVerify}>
            Verifikasi
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setDialog('teruskan')}>
              Teruskan ke instansi
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => setDialog('tolak')}>
              Tolak
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={dialog === 'teruskan'}
        title="Teruskan ke instansi"
        onClose={() => setDialog(null)}
        footer={
          <Button variant="primary" onClick={doForward}>
            Teruskan ke instansi
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Kanal">
            {(fid) => (
              <Select id={fid} value={agency} onChange={(e) => setAgency(e.target.value)}>
                {AGENCIES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Catatan (opsional)">{(fid) => <TextArea id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
        </div>
      </Dialog>

      <Dialog
        open={dialog === 'tolak'}
        title="Tolak"
        onClose={() => setDialog(null)}
        footer={
          <Button variant="danger" onClick={doReject}>
            Tolak
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-semibold text-ink-2">Alasan</legend>
            {REJECT_REASONS.map((r) => (
              <label key={r} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                <input type="radio" name="reject" checked={rejectReason === r} onChange={() => setRejectReason(r)} className="h-5 w-5 accent-brand-blue" />
                {REJECT_REASON_LABEL[r]}
              </label>
            ))}
          </fieldset>
          <Field label="Catatan" error={rejectErr}>
            {(fid, d) => <TextArea id={fid} aria-describedby={d} invalid={!!rejectErr} maxLength={300} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />}
          </Field>
        </div>
      </Dialog>
    </div>
  )
}
