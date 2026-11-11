/**
 * M-S09 Buat aksi — UI-SPEC S09 + M: form bertahap 3 langkah: Info → Titik (peta) → Tugas & keselamatan.
 * Juga dipakai untuk "Ubah aksi" (S11 #10) lewat `?ubah=<id>` — form terisi, sukses "Aksi diperbarui.".
 * Draf AI = contoh AI-PROMPTS §4.3 (tidak memanggil AI). Varian: draf_memuat, already_exists.
 * [ASUMSI] pembagian field per langkah: Info = ringkasan, draf AI, judul, jadwal, relawan, alat;
 * Titik = titik kumpul & buang; Tugas & keselamatan = catatan keselamatan, TaskEditor.
 */
import { Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox, SyntheticMark } from '../components/Banners'
import { CategoryBadge } from '../components/CategoryBadge'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { PointPicker } from '../components/ReportInputs'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { RemovableChip } from '../components/ui/Chip'
import { Field, Select, TextArea, TextInput } from '../components/ui/Input'
import { Stepper } from '../components/ui/Toggle'
import { actionById, COMMUNITY_MEMBER_IDS } from '../data/actions'
import { NOW } from '../data/clock'
import { reportById } from '../data/reports'
import type { LatLng } from '../data/types'
import { userById } from '../data/users'
import { cn } from '../lib/cn'
import { SKILLS, SKILL_LABEL, type Skill } from '../lib/labels'
import { ACTION_PLAN_DRAFT } from '../lib/mockAi'

interface TaskRow {
  key: number
  title: string
  skill: Skill
  quota: number
  needsRoute: boolean
  assignees: number[]
}

const STEPS = ['Info', 'Titik', 'Tugas & keselamatan'] as const

export default function MS09CreateAction() {
  const { screenState, showToast, isFallback, userId } = useMock()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editing = params.get('ubah') ? actionById(Number(params.get('ubah'))) : undefined
  const report = reportById(editing?.reportId ?? Number(params.get('report') ?? 2)) ?? reportById(2)!
  const members = COMMUNITY_MEMBER_IDS[userById(userId ?? 4)?.communityId ?? 1] ?? []

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState(editing?.title ?? '')
  const [schedule, setSchedule] = useState(editing?.scheduledAt.slice(0, 16) ?? '')
  const [volunteers, setVolunteers] = useState(editing?.volunteers ?? report.triage.estVolunteers ?? 8)
  const [draftVolunteers, setDraftVolunteers] = useState(volunteers)
  const [tools, setTools] = useState<string[]>(editing?.tools ?? [])
  const [toolInput, setToolInput] = useState('')
  const [meet, setMeet] = useState<LatLng | null>(editing?.meetingPoint.at ?? null)
  const [meetName, setMeetName] = useState(editing?.meetingPoint.name ?? '')
  const [drop, setDrop] = useState<LatLng | null>(editing?.dropoff?.at ?? null)
  const [dropName, setDropName] = useState(editing?.dropoff?.name ?? '')
  const [safety, setSafety] = useState<string[]>(editing?.safetyNotes ?? [''])
  const [tasks, setTasks] = useState<TaskRow[]>(
    editing?.tasks.map((t) => ({ key: t.id, title: t.title, skill: t.skill, quota: t.quota, needsRoute: t.needsRoute, assignees: t.assigneeIds })) ?? [],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const draftLoading = screenState === 'draf_memuat'
  const alreadyExists = screenState === 'already_exists'

  const useDraft = () => {
    setTools(ACTION_PLAN_DRAFT.alat)
    setSafety(ACTION_PLAN_DRAFT.catatan_keselamatan)
    setTasks(ACTION_PLAN_DRAFT.tugas.map((t, i) => ({ key: i, title: t.judul, skill: t.keahlian, quota: t.relawan, needsRoute: t.butuh_rute, assignees: [] })))
    if (!title) setTitle('Bersih lahan musala')
  }

  // Validasi per langkah — UI-SPEC S09 kolom "Validasi". Teks yang tidak ditentukan ditandai [ASUMSI].
  const validateStep = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (title.trim().length < 5 || title.length > 200) e.title = 'Judul aksi minimal 5 karakter' // [ASUMSI]
      if (!schedule) e.schedule = 'Jadwal harus di masa depan'
      else if (new Date(schedule) <= NOW) e.schedule = 'Jadwal harus di masa depan'
      if (tools.some((t) => t.length < 2 || t.length > 60) || tools.length > 20) e.tools = 'Tiap alat 2–60 karakter, maks 20' // [ASUMSI]
    }
    if (s === 1) {
      if (!meet) e.meet = 'Tandai titik kumpul' // [ASUMSI]
      if (meetName.trim().length < 3) e.meetName = 'Nama titik kumpul minimal 3 karakter' // [ASUMSI]
      if (drop && dropName.trim().length < 3) e.dropName = 'Nama titik buang wajib diisi' // [ASUMSI]
    }
    if (s === 2) {
      const filled = safety.filter((x) => x.trim())
      if (filled.length < 1 || filled.some((x) => x.trim().length < 5)) e.safety = 'Minimal 1 catatan keselamatan'
      if (tasks.length < 1) e.tasks = 'Minimal 1 tugas' // [ASUMSI]
      if (tasks.some((t) => t.title.trim().length < 3 || t.quota < 1 || t.quota > 50)) e.tasks = 'Judul tugas minimal 3 karakter; kuota 1–50' // [ASUMSI]
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => validateStep(step) && setStep((s) => s + 1)
  const save = () => {
    if (!validateStep(2)) return
    if (editing) {
      showToast('Aksi diperbarui.')
      navigate(`/aksi/${editing.id}`, { replace: true })
    } else {
      showToast('Aksi dibuat. Relawan bisa mulai mengambil tugas.')
      navigate('/aksi/3', { replace: true })
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppBar back title={editing ? 'Ubah aksi' : 'Buat aksi'} subtitle={`Langkah ${step + 1} dari 3: ${STEPS[step]}`} />
      <ScreenBody className="flex-1">
        {/* Indikator langkah */}
        <ol className="flex gap-2" aria-label="Langkah">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-1">
              <span className={cn('h-1.5 rounded-full', i <= step ? 'bg-brand-green' : 'bg-white/20')} />
              <span className={cn('text-[11px]', i === step ? 'font-bold text-white' : 'text-white/60')}>{s}</span>
            </li>
          ))}
        </ol>

        {alreadyExists && (
          <NoticeBox tone="red">
            Laporan ini sudah punya aksi aktif.{' '}
            <Link to="/aksi/3" className="font-bold text-brand-blue underline">
              Lihat aksi
            </Link>
          </NoticeBox>
        )}

        {step === 0 && (
          <>
            {/* #1 Ringkasan laporan */}
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-bold text-ink">
                {report.title} <SyntheticMark />
              </p>
              <CategoryBadge category={report.category} />
              <MapPlaceholder className="h-24 rounded-xl" points={[{ id: report.id, at: report.location, tone: 'blue', label: 'Lokasi laporan', shape: 'pin' }]} />
            </Card>

            {/* #2 Kotak draf AI */}
            {!editing && (
              <Card className="flex flex-col gap-2 border-ai/30">
                <CardTitle right={!draftLoading && <AiBadge source="gemini" />}>Draf rencana dari AI</CardTitle>
                {draftLoading ? (
                  <p className="text-sm text-muted" aria-live="polite">
                    Menyusun draf rencana…
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-ink-2">Periksa dan ubah sesuai kondisi lapangan.</p>
                    {isFallback && <p className="text-sm text-ink-2">Draf ini templat standar untuk kategori sampah.</p>}
                    <ul className="list-disc pl-5 text-sm text-ink">
                      {ACTION_PLAN_DRAFT.tugas.map((t) => (
                        <li key={t.judul}>
                          {t.judul} — {SKILL_LABEL[t.keahlian]}, {t.relawan} relawan
                        </li>
                      ))}
                    </ul>
                    <Button variant="small" onClick={useDraft} className="self-start">
                      Pakai draf
                    </Button>
                  </>
                )}
              </Card>
            )}

            <Card className="flex flex-col gap-4">
              <Field label="Judul aksi" error={errors.title}>
                {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.title} placeholder="Contoh: Bersih lahan musala" value={title} onChange={(e) => setTitle(e.target.value)} />}
              </Field>
              <Field label="Tanggal & jam mulai" error={errors.schedule}>
                {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.schedule} type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />}
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Jumlah relawan</span>
                <Stepper label="Jumlah relawan" value={volunteers} min={1} max={100} onChange={setVolunteers} />
                {!editing && volunteers !== draftVolunteers && (
                  <Button variant="link" className="self-start" onClick={() => setDraftVolunteers(volunteers)}>
                    Minta draf ulang
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Alat yang dibawa</span>
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((t) => (
                    <RemovableChip key={t} onRemove={() => setTools(tools.filter((x) => x !== t))}>
                      {t}
                    </RemovableChip>
                  ))}
                </div>
                <TextInput
                  aria-label="Alat yang dibawa"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && toolInput.trim()) {
                      e.preventDefault()
                      setTools([...tools, toolInput.trim()])
                      setToolInput('')
                    }
                  }}
                />
                {errors.tools && <p className="text-xs font-semibold text-accent-red">{errors.tools}</p>}
              </div>
            </Card>
          </>
        )}

        {step === 1 && (
          <Card className="flex flex-col gap-4">
            <PointPicker label="Titik kumpul" value={meet} onChange={setMeet} error={errors.meet} />
            <Field label="Nama titik kumpul" error={errors.meetName}>
              {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.meetName} maxLength={150} placeholder="Pos RW 05" value={meetName} onChange={(e) => setMeetName(e.target.value)} />}
            </Field>
            <PointPicker label="Titik buang/serah (opsional)" value={drop} onChange={setDrop} />
            <Field label="Nama titik buang/serah" error={errors.dropName}>
              {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.dropName} maxLength={150} placeholder="TPS Tebet Barat" value={dropName} onChange={(e) => setDropName(e.target.value)} />}
            </Field>
          </Card>
        )}

        {step === 2 && (
          <>
            <Card className="flex flex-col gap-3">
              <CardTitle>Catatan keselamatan</CardTitle>
              {safety.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TextArea aria-label={`Catatan keselamatan ${i + 1}`} maxLength={300} value={s} onChange={(e) => setSafety(safety.map((x, j) => (j === i ? e.target.value : x)))} className="min-h-16 flex-1" />
                  <button type="button" aria-label="Hapus catatan" onClick={() => setSafety(safety.filter((_, j) => j !== i))} className="min-h-11 min-w-11 cursor-pointer text-muted">
                    <Trash size={16} className="mx-auto" />
                  </button>
                </div>
              ))}
              {errors.safety && <p className="text-xs font-semibold text-accent-red">{errors.safety}</p>}
              <Button variant="outline" icon={<Plus size={16} />} onClick={() => setSafety([...safety, ''])}>
                Tambah catatan
              </Button>
            </Card>

            {tasks.map((t, i) => (
              <Card key={t.key} className="flex flex-col gap-3">
                <CardTitle
                  right={
                    <button type="button" aria-label="Hapus tugas" onClick={() => setTasks(tasks.filter((x) => x.key !== t.key))} className="min-h-11 min-w-11 cursor-pointer text-muted">
                      <Trash size={16} className="mx-auto" />
                    </button>
                  }
                >
                  Tugas {i + 1}
                </CardTitle>
                <TaskFields task={t} members={members} onChange={(nt) => setTasks(tasks.map((x) => (x.key === t.key ? nt : x)))} />
              </Card>
            ))}
            {errors.tasks && <p className="text-xs font-semibold text-white">{errors.tasks}</p>}
            <Button variant="outline" icon={<Plus size={16} />} onClick={() => setTasks([...tasks, { key: Date.now(), title: '', skill: 'angkut', quota: 1, needsRoute: false, assignees: [] }])}>
              Tambah tugas
            </Button>
          </>
        )}
      </ScreenBody>

      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-line bg-surface px-4 py-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
            Kembali
          </Button>
        )}
        {step < 2 ? (
          <Button variant="primary" onClick={next} className="flex-1 py-3.5">
            Lanjut
          </Button>
        ) : (
          <Button variant="confirm" onClick={save} disabled={alreadyExists} className="flex-1">
            {editing ? 'Ubah aksi' : 'Buat aksi'}
          </Button>
        )}
      </div>
    </div>
  )
}

/** Satu baris TaskEditor (UI-SPEC S09 #10; juga dialog "+ Tambah tugas" S11 #11). */
export function TaskFields({ task, members, onChange }: { task: TaskRow; members: number[]; onChange: (t: TaskRow) => void }) {
  return (
    <>
      <Field label="Judul tugas">{(id) => <TextInput id={id} maxLength={200} value={task.title} onChange={(e) => onChange({ ...task, title: e.target.value })} />}</Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Keahlian">
          {(id) => (
            <Select id={id} value={task.skill} onChange={(e) => onChange({ ...task, skill: e.target.value as Skill })}>
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {SKILL_LABEL[s]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Kuota">{(id) => <TextInput id={id} type="number" min={1} max={50} value={task.quota} onChange={(e) => onChange({ ...task, quota: +e.target.value })} />}</Field>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={task.needsRoute} onChange={(e) => onChange({ ...task, needsRoute: e.target.checked })} className="h-5 w-5 accent-brand-blue" />
        Butuh rute (angkut)
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-semibold text-ink-2">Tugaskan ke</legend>
        <div className="flex flex-wrap gap-1.5">
          {members.map((m) => {
            const on = task.assignees.includes(m)
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...task, assignees: on ? task.assignees.filter((x) => x !== m) : [...task.assignees, m] })}
                className={cn('min-h-11 cursor-pointer rounded-full border px-3 text-xs font-semibold', on ? 'border-brand-blue bg-brand-blue text-white' : 'border-line bg-surface-2 text-ink-2')}
              >
                {userById(m)?.name}
              </button>
            )
          })}
        </div>
      </fieldset>
    </>
  )
}
export type { TaskRow }
