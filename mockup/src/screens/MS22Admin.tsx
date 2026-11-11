/**
 * M-S22 Admin mobile — UI-SPEC M-S22 / S17: tab Pengguna, Komunitas, Log AI; di "Lainnya": Kanal instansi,
 * Laporan ditolak + "Buka ulang". Form dibuka sebagai layar penuh.
 * [PERLU DIVERIFIKASI] SDD §8A.2/§8A.4 menyebut admin tidak ada di mobile ("Panel admin tersedia di web"),
 * sedangkan UI-SPEC v3.0 menambah M-S22 — mockup mengikuti UI-SPEC.
 * [ASUMSI] label tombol "Tambah komunitas" / "Tambah kanal" (UI-SPEC hanya menyebut "Tambah pengguna").
 */
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { SyntheticMark } from '../components/Banners'
import { Dialog } from '../components/Dialog'
import { PointPicker } from '../components/ReportInputs'
import { Badge } from '../components/StatusChip'
import { EmptyState, StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Field, Select, TextArea, TextInput } from '../components/ui/Input'
import { AGENCIES } from '../data/agencies'
import { AI_LOGS } from '../data/aiLogs'
import { AREAS } from '../data/areas'
import { COMMUNITIES } from '../data/communities'
import { REPORTS } from '../data/reports'
import type { LatLng } from '../data/types'
import { USERS } from '../data/users'
import { formatDateTime } from '../lib/format'
import { CATEGORIES, CATEGORY_LABEL, REJECT_REASON_LABEL, SKILLS, SKILL_LABEL, type Category, type Skill } from '../lib/labels'
import NotFound from './system/NotFound'

type Section = 'pengguna' | 'komunitas' | 'log-ai' | 'kanal' | 'ditolak'
const TITLE: Record<Section, string> = {
  pengguna: 'Pengguna',
  komunitas: 'Komunitas',
  'log-ai': 'Log AI',
  kanal: 'Kanal instansi',
  ditolak: 'Laporan ditolak',
}
const ROLES = ['warga', 'moderator', 'instansi', 'admin'] as const
const ALL_KEC = AREAS.map((a) => a.kecamatan)

export default function MS22Admin() {
  const { section = 'pengguna' } = useParams()
  const { screenState, showToast } = useMock()
  const [formOpen, setFormOpen] = useState(false)
  if (!(section in TITLE)) return <NotFound />
  const s = section as Section

  if (formOpen) return <AdminForm section={s} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); showToast('Tersimpan.') }} />

  const empty = screenState === 'kosong'
  const addLabel = s === 'pengguna' ? 'Tambah pengguna' : s === 'komunitas' ? 'Tambah komunitas' : s === 'kanal' ? 'Tambah kanal' : null

  return (
    <>
      <AppBar back={s === 'kanal' || s === 'ditolak'} title={TITLE[s]} />
      <ScreenBody>
        {addLabel && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setFormOpen(true)}>
            {addLabel}
          </Button>
        )}
        <StdStates state={screenState}>
          {empty ? <EmptyState text="Belum ada data." /> : <SectionList section={s} />}
        </StdStates>
      </ScreenBody>
    </>
  )
}

function Row({ title, lines, right }: { title: React.ReactNode; lines: React.ReactNode[]; right?: React.ReactNode }) {
  return (
    <Card className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-bold text-ink">{title}</span>
        {lines.map((l, i) => (
          <span key={i} className="text-xs text-muted">
            {l}
          </span>
        ))}
      </div>
      {right}
    </Card>
  )
}

function SectionList({ section }: { section: Section }) {
  const { showToast } = useMock()
  const [reopening, setReopening] = useState<number | null>(null)
  const [reopened, setReopened] = useState<number[]>([])
  const [reason, setReason] = useState('')
  const [err, setErr] = useState<string | null>(null)

  if (section === 'pengguna')
    return (
      <>
        {USERS.map((u) => (
          <Row key={u.id} title={u.name} lines={[u.email, `Peran: ${u.role}${u.scopeKecamatan ? ` · Kecamatan ${u.scopeKecamatan}` : ''}`]} />
        ))}
      </>
    )
  if (section === 'komunitas')
    return (
      <>
        {COMMUNITIES.map((c) => (
          <Row key={c.id} title={c.name} lines={[`Kecamatan ${c.kecamatan} · ${c.kelurahan.join(', ')}`, `Keahlian: ${c.skills.map((k) => SKILL_LABEL[k]).join(', ')}`]} />
        ))}
      </>
    )
  if (section === 'kanal')
    return (
      <>
        {AGENCIES.map((a) => (
          <Row key={a.id} title={a.name} lines={[a.url ?? 'URL [PERLU DIVERIFIKASI]', `Kecamatan: ${a.kecamatan ?? '— (nasional)'}`, a.note]} />
        ))}
      </>
    )
  if (section === 'log-ai')
    return (
      <>
        {AI_LOGS.map((l) => (
          <Row
            key={l.id}
            title={l.purpose}
            right={<AiBadge source={l.source} />}
            lines={[formatDateTime(l.at), `Status: ${l.status} · Token: ${l.tokens ?? '—'} · Latensi: ${l.latencyMs ?? '—'}`, l.corrected ? <Badge key="koreksi" tone="amber">dikoreksi</Badge> : '']}
          />
        ))}
      </>
    )

  // Laporan ditolak + "Buka ulang" (R9)
  const rejected = REPORTS.filter((r) => r.status === 'ditolak' && !reopened.includes(r.id))
  return (
    <>
      {rejected.length === 0 ? (
        <EmptyState text="Belum ada data." />
      ) : (
        rejected.map((r) => (
          <Card key={r.id} className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink">
              {r.title} <SyntheticMark />
            </span>
            <span className="text-xs text-muted">
              {r.rejectReason ? REJECT_REASON_LABEL[r.rejectReason] : '—'} · {formatDateTime(r.history[r.history.length - 1].at)}
            </span>
            <Button variant="outline" onClick={() => setReopening(r.id)}>
              Buka ulang
            </Button>
          </Card>
        ))
      )}
      <Dialog
        open={reopening !== null}
        title="Buka ulang"
        onClose={() => setReopening(null)}
        footer={
          <Button
            variant="primary"
            onClick={() => {
              const n = reason.trim().length
              if (n < 5 || n > 300) return setErr('Alasan 5–300 karakter') // [ASUMSI] teks validasi
              setReopened((x) => [...x, reopening!])
              setReopening(null)
              setReason('')
              setErr(null)
              showToast('Laporan kembali ke antrian moderasi.')
            }}
          >
            Buka ulang
          </Button>
        }
      >
        <Field label="Alasan banding" error={err}>
          {(fid, d) => <TextArea id={fid} aria-describedby={d} invalid={!!err} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />}
        </Field>
      </Dialog>
    </>
  )
}

/** Form layar penuh (M-S22). Validasi API U2/G3/H2 disederhanakan. */
function AdminForm({ section, onClose, onSaved }: { section: Section; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState<(typeof ROLES)[number]>('warga')
  const [kec, setKec] = useState('')
  const [cats, setCats] = useState<Category[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [kels, setKels] = useState<string[]>([])
  const [base, setBase] = useState<LatLng | null>(null)
  const [url, setUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x])
  const kelOptions = AREAS.find((a) => a.kecamatan === kec)?.kelurahan ?? []

  const save = () => {
    if (section === 'pengguna' && (role === 'moderator' || role === 'instansi') && !kec) return setErr('Kecamatan wajib untuk moderator/instansi') // [ASUMSI]
    if (section === 'kanal' && url && !url.startsWith('https://')) return setErr('URL harus https') // [ASUMSI]
    onSaved()
  }

  return (
    <>
      <AppBar back={false} title={section === 'pengguna' ? 'Tambah pengguna' : section === 'komunitas' ? 'Tambah komunitas' : 'Tambah kanal'} right={<Button variant="small" className="bg-surface text-ink" onClick={onClose}>Batal</Button>} />
      <ScreenBody>
        <Card className="flex flex-col gap-3">
          {section === 'pengguna' && (
            <>
              <Field label="Nama">{(id) => <TextInput id={id} />}</Field>
              <Field label="Email">{(id) => <TextInput id={id} type="email" />}</Field>
              <Field label="Kata sandi">{(id) => <TextInput id={id} type="password" />}</Field>
              <Field label="Peran">
                {(id) => (
                  <Select id={id} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Kecamatan">
                {(id) => (
                  <Select id={id} value={kec} onChange={(e) => setKec(e.target.value)}>
                    <option value="">—</option>
                    {ALL_KEC.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </>
          )}
          {section === 'komunitas' && (
            <>
              <Field label="Nama">{(id) => <TextInput id={id} />}</Field>
              <Field label="Deskripsi">{(id) => <TextArea id={id} />}</Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Kategori</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <Chip key={c} active={cats.includes(c)} onClick={() => setCats(toggle(cats, c))}>
                      {CATEGORY_LABEL[c]}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Keahlian</span>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS.map((k) => (
                    <Chip key={k} active={skills.includes(k)} onClick={() => setSkills(toggle(skills, k))}>
                      {SKILL_LABEL[k]}
                    </Chip>
                  ))}
                </div>
              </div>
              <Field label="Kecamatan">
                {(id) => (
                  <Select id={id} value={kec} onChange={(e) => { setKec(e.target.value); setKels([]) }}>
                    <option value="">—</option>
                    {ALL_KEC.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-2">Kelurahan layanan</span>
                <div className="flex flex-wrap gap-1.5">
                  {kelOptions.map((k) => (
                    <Chip key={k} active={kels.includes(k)} onClick={() => setKels(toggle(kels, k))}>
                      {k}
                    </Chip>
                  ))}
                </div>
              </div>
              <PointPicker label="Markas" value={base} onChange={setBase} />
              <Field label="Kontak">{(id) => <TextInput id={id} />}</Field>
              <Field label="Koordinator (email)">{(id) => <TextInput id={id} type="email" />}</Field>
            </>
          )}
          {section === 'kanal' && (
            <>
              <Field label="Nama">{(id) => <TextInput id={id} />}</Field>
              <Field label="URL">{(id) => <TextInput id={id} inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} />}</Field>
              <Field label="Kategori">{(id) => <TextInput id={id} />}</Field>
              <Field label="Kecamatan" hint="Kosong = nasional">
                {(id) => (
                  <Select id={id} value={kec} onChange={(e) => setKec(e.target.value)}>
                    <option value="">—</option>
                    {ALL_KEC.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Catatan">{(id) => <TextArea id={id} />}</Field>
            </>
          )}
          {err && <p className="text-xs font-semibold text-accent-red">{err}</p>}
          <Button variant="primary" onClick={save}>
            Simpan
          </Button>
        </Card>
      </ScreenBody>
    </>
  )
}
