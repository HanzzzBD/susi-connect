/**
 * M-S11 Detail aksi — UI-SPEC S11 + M: tab "Tugas" / "Rute" / "Bukti"; tombol "Saya sudah tiba" besar di bawah.
 * Rute & perbandingan memakai angka contoh API.md P1/P2 (sintetis, berlabel "perkiraan").
 * Varian: garis_lurus, izin_ditolak, kuota_penuh, evidence_required, hindari_hambatan.
 */
import { Bus, CircleCheckBig, Plus, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { Dialog } from '../components/Dialog'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PhotoPicker, usePermission, type PickedPhoto } from '../components/ReportInputs'
import { BeforeAfter, KeyValue } from '../components/ReportParts'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { Badge, StatusChip } from '../components/StatusChip'
import { StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Field, TextArea, TextInput } from '../components/ui/Input'
import { actionById, COMMUNITY_MEMBER_IDS } from '../data/actions'
import { communityById } from '../data/communities'
import { evidencesForAction } from '../data/evidences'
import { OBSTACLES, obstacleDisplayStatus } from '../data/obstacles'
import { reportById } from '../data/reports'
import type { LatLng, Task } from '../data/types'
import { userById } from '../data/users'
import { formatDateTime, formatDistance, formatDuration } from '../lib/format'
import { ROUTE_PROFILE_LABEL, ROUTE_SOURCE_LABEL, SKILL_LABEL, type ActionStatus, type RouteProfile, type RouteSource } from '../lib/labels'
import { TaskFields, type TaskRow } from './MS09CreateAction'
import NotFound from './system/NotFound'

type Tab = 'tugas' | 'rute' | 'bukti'

/** Contoh API.md P2 (jarak m, durasi dtk, biaya). */
const COMPARE: { profile: RouteProfile; distance: number; duration: number; cost: number | null }[] = [
  { profile: 'foot-walking', distance: 1650, duration: 1260, cost: 0 },
  { profile: 'cycling-regular', distance: 1720, duration: 480, cost: 0 },
  { profile: 'driving-car', distance: 1840, duration: 420, cost: null },
]
/** Lokasi GPS simulasi relawan [ASUMSI]. */
const MY_LOCATION: LatLng = { lat: -6.2287, lng: 106.8502 }

export default function MS11ActionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { screenState, userId, showToast, isFallback, hotspot } = useMock()
  const action = actionById(Number(id))
  const [tab, setTab] = useState<Tab>('tugas')
  const [status, setStatus] = useState<ActionStatus>(action?.status ?? 'direncanakan')
  const [tasks, setTasks] = useState<Task[]>(action?.tasks ?? [])
  const [dialog, setDialog] = useState<'tugaskan' | 'tambah' | 'ajukan' | 'batal' | null>(null)
  const [assignTask, setAssignTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState<TaskRow>({ key: 0, title: '', skill: 'angkut', quota: 1, needsRoute: false, assignees: [] })
  const [cancelReason, setCancelReason] = useState('')
  const [cancelErr, setCancelErr] = useState<string | null>(null)
  const [hours, setHours] = useState<Record<number, number>>({})
  const [kg, setKg] = useState('')
  const [submitErr, setSubmitErr] = useState<string | null>(null)
  // Rute
  const [origin, setOrigin] = useState<'saya' | 'kumpul'>('kumpul')
  const [dest, setDest] = useState<'lokasi' | 'buang'>('lokasi')
  const [profile, setProfile] = useState<RouteProfile>('driving-car')
  const [locDenied, setLocDenied] = useState(false)
  const { request, dialog: permDialog } = usePermission()
  // Bukti
  const existing = action ? evidencesForAction(action.id) : []
  const [before, setBefore] = useState<PickedPhoto[]>([])
  const [after, setAfter] = useState<PickedPhoto[]>([])
  const [useReportPhoto, setUseReportPhoto] = useState(false)
  const [evidenceNote, setEvidenceNote] = useState('')

  if (!action) return <NotFound />
  const report = reportById(action.reportId)!
  const community = communityById(action.communityId)
  const me = userId ? userById(userId) : undefined
  const isCoordinator = me?.memberRole === 'koordinator' && me.communityId === action.communityId
  const isMember = me?.communityId === action.communityId
  const myTasks = tasks.filter((t) => t.assigneeIds.includes(userId ?? -1))
  const checkedIn = myTasks.some((t) => t.checkedInIds.includes(userId ?? -1))
  const hasAfter = after.length > 0 || existing.some((e) => e.kind === 'after')
  const afterStatus = existing.find((e) => e.kind === 'after')?.status
  const active = status === 'direncanakan' || status === 'berjalan'

  /* ---- Tugas ---- */
  const updateTask = (tid: number, fn: (t: Task) => Task) => setTasks((ts) => ts.map((t) => (t.id === tid ? fn(t) : t)))
  const take = (t: Task) => {
    if (screenState === 'kuota_penuh' || t.assigneeIds.length >= t.quota) return showToast('Tugas ini sudah penuh.', 'error')
    updateTask(t.id, (x) => {
      const ids = [...x.assigneeIds, userId!]
      return { ...x, assigneeIds: ids, status: ids.length >= x.quota ? 'diambil' : 'terbuka' }
    })
  }
  const release = (t: Task) => updateTask(t.id, (x) => ({ ...x, assigneeIds: x.assigneeIds.filter((i) => i !== userId), status: 'terbuka' }))
  const checkIn = () => {
    myTasks.forEach((t) => updateTask(t.id, (x) => ({ ...x, checkedInIds: [...x.checkedInIds, userId!] })))
    if (status === 'direncanakan') setStatus('berjalan') // check-in pertama memulai aksi (PRD §8.6)
  }

  /* ---- Koordinator ---- */
  const submitVerification = () => {
    if (screenState === 'evidence_required' || !hasAfter) return setSubmitErr('Unggah minimal 1 foto sesudah sebelum mengajukan verifikasi.')
    setSubmitErr(null)
    setDialog(null)
    setStatus('menunggu_verifikasi')
  }
  const cancelAction = () => {
    if (cancelReason.trim().length < 5) return setCancelErr('Alasan wajib diisi') // [ASUMSI] teks validasi
    setDialog(null)
    setStatus('dibatalkan')
  }

  /* ---- Rute ---- */
  const needsRouteTask = tasks.some((t) => t.needsRoute) && !!action.dropoff
  const source: RouteSource = screenState === 'garis_lurus' || hotspot ? 'straight' : isFallback ? 'cache' : 'ors'
  const from = origin === 'saya' && !locDenied ? MY_LOCATION : action.meetingPoint.at
  const routePts: LatLng[] =
    source === 'straight'
      ? [from, report.location, ...(dest === 'buang' && action.dropoff ? [action.dropoff.at] : [])]
      : [from, { lat: from.lat - 0.0012, lng: report.location.lng }, report.location, ...(dest === 'buang' && action.dropoff ? [{ lat: report.location.lat - 0.0015, lng: action.dropoff.at.lng }, action.dropoff.at] : [])]
  const sel = COMPARE.find((c) => c.profile === profile)!
  const avoided = screenState === 'hindari_hambatan' ? OBSTACLES[0] : null

  const pickOrigin = (o: 'saya' | 'kumpul') => {
    if (o === 'kumpul') return setOrigin('kumpul')
    request(
      'lokasi',
      () => {
        setLocDenied(false)
        setOrigin('saya')
      },
      () => {
        setLocDenied(true)
        setOrigin('kumpul')
      },
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppBar back title="Detail aksi" subtitle={action.code} />
      <ScreenBody className="flex-1">
        <StdStates state={screenState} shape="detail">
          {/* #1 Header */}
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">
              {action.title} <SyntheticMark />
            </h2>
            <div className="flex flex-wrap gap-1">
              <StatusChip kind="action" value={status} />
            </div>
            <p className="text-xs text-muted">
              {community?.name} · {formatDateTime(action.scheduledAt)}
            </p>
          </Card>

          {status === 'menunggu_verifikasi' && <NoticeBox tone="amber">Bukti sedang diperiksa moderator atau pelapor.</NoticeBox>}
          {status === 'terverifikasi' && (
            <NoticeBox tone="green" icon={<CircleCheckBig size={16} className="text-brand-green" />}>
              Aksi selesai dan terverifikasi. Terima kasih!
            </NoticeBox>
          )}

          {/* #2 SafetyNotes — selalu terlihat */}
          <Card className="flex flex-col gap-2 border-brand-orange/50">
            <CardTitle right={<ShieldAlert size={18} className="text-brand-orange" aria-hidden />}>Catatan keselamatan</CardTitle>
            <ul className="list-disc pl-5 text-sm text-ink">
              {action.safetyNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Card>

          {/* #3 Info */}
          <Card>
            <KeyValue label="Titik kumpul">{action.meetingPoint.name}</KeyValue>
            <KeyValue label="Titik buang">{action.dropoff?.name ?? '—'}</KeyValue>
            <KeyValue label="Alat">{action.tools.join(', ')}</KeyValue>
          </Card>

          <SegmentedTabs
            label="Detail aksi"
            value={tab}
            onChange={setTab}
            tabs={[
              { key: 'tugas', label: 'Tugas' },
              { key: 'rute', label: 'Rute' },
              { key: 'bukti', label: 'Bukti' },
            ]}
          />

          {/* ---------- Tab Tugas (#4, #9–#11) ---------- */}
          {tab === 'tugas' && (
            <>
              {tasks.map((t) => {
                const mine = t.assigneeIds.includes(userId ?? -1)
                return (
                  <Card key={t.id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-ink">{t.title}</p>
                        <p className="text-xs text-muted">
                          {SKILL_LABEL[t.skill]} · {t.assigneeIds.length}/{t.quota} relawan
                          {t.needsRoute && ' · butuh rute'}
                        </p>
                      </div>
                      <StatusChip kind="task" value={t.status} />
                    </div>
                    {mine && <Badge tone="blue">Tugasmu</Badge>}
                    <div className="flex flex-wrap gap-2">
                      {isMember && active && !mine && t.status !== 'selesai' && (
                        <Button variant="small" onClick={() => take(t)}>
                          Ambil tugas
                        </Button>
                      )}
                      {mine && active && t.status !== 'selesai' && (
                        <>
                          <Button variant="small" className="bg-surface text-ink border border-line" onClick={() => release(t)}>
                            Lepas
                          </Button>
                          {status === 'berjalan' && (
                            <Button variant="small" onClick={() => updateTask(t.id, (x) => ({ ...x, status: 'selesai' }))}>
                              Tandai selesai
                            </Button>
                          )}
                        </>
                      )}
                      {isCoordinator && active && (
                        <Button variant="small" onClick={() => { setAssignTask(t); setDialog('tugaskan') }}>
                          Tugaskan
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
              {isCoordinator && active && (
                <Button variant="outline" icon={<Plus size={16} />} onClick={() => setDialog('tambah')}>
                  Tambah tugas
                </Button>
              )}
              {isCoordinator && (
                <Card className="flex flex-col gap-2">
                  {status === 'direncanakan' && (
                    <>
                      <Button variant="primary" onClick={() => setStatus('berjalan')}>
                        Mulai aksi
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/aksi/baru?ubah=${action.id}`)}>
                        Ubah aksi
                      </Button>
                    </>
                  )}
                  {status === 'berjalan' && (
                    <Button variant="confirm" onClick={() => setDialog('ajukan')}>
                      Ajukan verifikasi
                    </Button>
                  )}
                  {submitErr && <p className="text-xs font-semibold text-accent-red">{submitErr}</p>}
                  {active && (
                    <Button variant="danger" onClick={() => setDialog('batal')}>
                      Batalkan aksi
                    </Button>
                  )}
                </Card>
              )}
            </>
          )}

          {/* ---------- Tab Rute (#5, #6) ---------- */}
          {tab === 'rute' && (
            <Card className="flex flex-col gap-3">
              <CardTitle>Rute ke lokasi</CardTitle>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink-2">Asal</span>
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={origin === 'saya'} onClick={() => pickOrigin('saya')}>
                    Lokasi saya
                  </Chip>
                  <Chip active={origin === 'kumpul'} onClick={() => pickOrigin('kumpul')}>
                    Titik kumpul
                  </Chip>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink-2">Tujuan</span>
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={dest === 'lokasi'} onClick={() => setDest('lokasi')}>
                    Lokasi masalah
                  </Chip>
                  {needsRouteTask && (
                    <Chip active={dest === 'buang'} onClick={() => setDest('buang')}>
                      Lokasi → titik buang
                    </Chip>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink-2">Moda</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMPARE.map((c) => (
                    <Chip key={c.profile} active={profile === c.profile} onClick={() => setProfile(c.profile)}>
                      {ROUTE_PROFILE_LABEL[c.profile]}
                    </Chip>
                  ))}
                </div>
              </div>

              {(locDenied || screenState === 'izin_ditolak') && <NoticeBox tone="amber">Izin lokasi ditolak. Rute dihitung dari titik kumpul.</NoticeBox>}
              {source === 'straight' && <NoticeBox tone="amber">Rute garis lurus — layanan rute tidak tersedia. Jarak dihitung lurus, bukan jalan.</NoticeBox>}

              <p className="text-base font-bold text-ink">
                {formatDistance(sel.distance)} · {formatDuration(sel.duration)} (perkiraan)
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge tone={source === 'straight' ? 'amber' : 'neutral'}>{ROUTE_SOURCE_LABEL[source]}</Badge>
              </div>
              {avoided && <p className="text-sm text-ink-2">Menghindari 1 hambatan: {avoided.description.replace(' (sintetis)', '')}</p>}

              <MapPlaceholder
                className="h-48 rounded-xl"
                route={routePts}
                routeStraight={source === 'straight'}
                points={[
                  { id: 'from', at: from, tone: 'blue', label: origin === 'saya' && !locDenied ? 'Lokasi saya' : 'Titik kumpul', shape: 'square' },
                  { id: 'loc', at: report.location, tone: 'red', label: 'Lokasi masalah', shape: 'pin' },
                  ...(action.dropoff ? [{ id: 'drop', at: action.dropoff.at, tone: 'green' as const, label: 'Titik buang', shape: 'square' as const }] : []),
                ]}
                circles={OBSTACLES.filter((o) => obstacleDisplayStatus(o) === 'aktif').map((o) => ({ id: o.id, at: o.location, radiusM: o.radiusM, tone: 'orange', label: o.description }))}
              />

              {/* #6 S02 Perbandingan */}
              <table className="w-full text-sm">
                {/* [ASUMSI] judul tabel perbandingan tidak ditentukan UI-SPEC */}
                <caption className="mb-1 text-left text-xs font-semibold text-ink-2">Perbandingan moda (perkiraan)</caption>
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-1.5 font-semibold">Moda</th>
                    <th className="py-1.5 font-semibold">Jarak</th>
                    <th className="py-1.5 font-semibold">Durasi</th>
                    <th className="py-1.5 font-semibold">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((c) => (
                    <tr key={c.profile} className="border-b border-line/60">
                      <td className="py-1.5 text-ink">{ROUTE_PROFILE_LABEL[c.profile]}</td>
                      <td className="py-1.5 text-ink">{formatDistance(c.distance)}</td>
                      <td className="py-1.5 text-ink">{formatDuration(c.duration)}</td>
                      <td className="py-1.5 text-ink">{c.cost === null ? '—' : `Rp ${c.cost}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted">Durasi dari OpenRouteService, belum memperhitungkan macet. Biaya kendaraan belum dihitung [PERLU DATA].</p>
              <Button variant="outline" icon={<Bus size={16} />} onClick={() => navigate(`/rute?ke=${encodeURIComponent(`Lokasi aksi ${action.code}`)}`)}>
                Rute angkutan umum ke lokasi
              </Button>
            </Card>
          )}

          {/* ---------- Tab Bukti (#7, #8) ---------- */}
          {tab === 'bukti' && (
            <Card className="flex flex-col gap-3">
              <CardTitle>Bukti</CardTitle>
              <BeforeAfter status={afterStatus} hasAfter={hasAfter} />
              {(isMember || isCoordinator) && active && (
                <>
                  <PhotoPicker label="Foto sebelum" photos={before} onChange={setBefore} max={3} />
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={useReportPhoto} onChange={(e) => setUseReportPhoto(e.target.checked)} className="h-5 w-5 accent-brand-blue" />
                    Pakai foto laporan
                  </label>
                  <PhotoPicker label="Foto sesudah" photos={after} onChange={setAfter} max={3} />
                  <Field label="Catatan (opsional)">{(fid) => <TextArea id={fid} value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} />}</Field>
                </>
              )}
            </Card>
          )}
        </StdStates>
      </ScreenBody>

      {/* M-S11: tombol "Saya sudah tiba" besar di bawah */}
      {myTasks.length > 0 && active && !checkedIn && tab === 'tugas' && (
        <div className="sticky bottom-0 z-10 border-t border-line bg-surface px-4 py-3">
          <Button variant="confirm" className="py-4 text-base" onClick={checkIn}>
            Saya sudah tiba
          </Button>
        </div>
      )}

      {/* Dialog Tugaskan */}
      <Dialog open={dialog === 'tugaskan' && !!assignTask} title="Tugaskan" onClose={() => setDialog(null)} footer={<Button variant="primary" onClick={() => setDialog(null)}>Tugaskan</Button>}>
        {assignTask && (
          <div className="flex flex-wrap gap-1.5">
            {(COMMUNITY_MEMBER_IDS[action.communityId] ?? []).map((m) => {
              const t = tasks.find((x) => x.id === assignTask.id)!
              const on = t.assigneeIds.includes(m)
              return (
                <Chip key={m} active={on} onClick={() => updateTask(t.id, (x) => ({ ...x, assigneeIds: on ? x.assigneeIds.filter((i) => i !== m) : [...x.assigneeIds, m] }))}>
                  {userById(m)?.name}
                </Chip>
              )
            })}
          </div>
        )}
      </Dialog>

      {/* Dialog + Tambah tugas (#11) */}
      <Dialog
        open={dialog === 'tambah'}
        title="Tambah tugas"
        onClose={() => setDialog(null)}
        footer={
          <Button
            variant="primary"
            onClick={() => {
              if (newTask.title.trim().length < 3) return
              setTasks((ts) => [...ts, { id: Date.now(), title: newTask.title, skill: newTask.skill, quota: newTask.quota, assigneeIds: newTask.assignees, status: 'terbuka', needsRoute: newTask.needsRoute, checkedInIds: [], isSynthetic: true }])
              setNewTask({ key: 0, title: '', skill: 'angkut', quota: 1, needsRoute: false, assignees: [] })
              setDialog(null)
              showToast('Tersimpan.') // [ASUMSI] teks sukses tidak ditentukan S11
            }}
          >
            Tambah tugas
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <TaskFields task={newTask} members={COMMUNITY_MEMBER_IDS[action.communityId] ?? []} onChange={setNewTask} />
        </div>
      </Dialog>

      {/* Dialog Ajukan verifikasi: jam per relawan + perkiraan sampah */}
      <Dialog open={dialog === 'ajukan'} title="Ajukan verifikasi" onClose={() => setDialog(null)} footer={<Button variant="confirm" onClick={submitVerification}>Ajukan verifikasi</Button>}>
        <div className="flex flex-col gap-3">
          {[...new Set(tasks.flatMap((t) => t.assigneeIds))].map((uid) => (
            <Field key={uid} label={`Jam — ${userById(uid)?.name}`}>
              {(fid) => <TextInput id={fid} type="number" min={0} step={0.5} value={hours[uid] ?? ''} onChange={(e) => setHours({ ...hours, [uid]: +e.target.value })} />}
            </Field>
          ))}
          <Field label="Perkiraan sampah terangkut (kg)">{(fid) => <TextInput id={fid} type="number" min={0} value={kg} onChange={(e) => setKg(e.target.value)} />}</Field>
          {submitErr && <p className="text-xs font-semibold text-accent-red">{submitErr}</p>}
        </div>
      </Dialog>

      {/* Dialog Batalkan aksi (alasan wajib) */}
      <Dialog open={dialog === 'batal'} title="Batalkan aksi" onClose={() => setDialog(null)} footer={<Button variant="danger" onClick={cancelAction}>Batalkan aksi</Button>}>
        <Field label="Alasan" error={cancelErr}>
          {(fid, d) => <TextArea id={fid} aria-describedby={d} invalid={!!cancelErr} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />}
        </Field>
      </Dialog>
      {permDialog}
    </div>
  )
}
