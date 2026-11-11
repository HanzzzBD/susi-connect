/**
 * M-S03A/B Lapor — UI-SPEC S03 + M: tab atas "Ceritakan" / "Formulir"; "Ambil foto" & "Pilih dari galeri";
 * "Pakai lokasi saya" meminta izin.
 * Chat memakai simulasi lokal (lib/mockAi.ts) — tidak memanggil AI.
 * Varian: ai_berpikir, off_topic, darurat, redirect_form, 429, izin_ditolak, luar_dki, foto_besar.
 * Mode cadangan (panel dev) → AiBadge "Aturan otomatis".
 */
import { Send, Siren, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox } from '../components/Banners'
import { CATEGORY_ICON } from '../components/CategoryBadge'
import { isInsideDki } from '../components/MapPlaceholder'
import { AreaSelect, PhotoPicker, PointPicker, type PickedPhoto } from '../components/ReportInputs'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { Badge } from '../components/StatusChip'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, Select, TextArea, TextInput } from '../components/ui/Input'
import type { LatLng } from '../data/types'
import { cn } from '../lib/cn'
import { CATEGORIES, CATEGORY_LABEL, URGENCIES, URGENCY_LABEL, type Category, type Urgency } from '../lib/labels'
import { MISSING_LABEL, simulateChat, type ChatExtract } from '../lib/mockAi'

type Tab = 'chat' | 'form'
interface Msg {
  from: 'user' | 'ai' | 'system'
  text: string
}

/** Isi bersama antara draf chat dan formulir ("Pindah ke formulir" membawa isi draf). */
interface ReportDraft {
  title: string
  description: string
  category: Category | ''
  landmark: string
  since: string
  urgency: Urgency | ''
  point: LatLng | null
  kecamatan: string
  kelurahan: string
  photos: PickedPhoto[]
}
const EMPTY: ReportDraft = { title: '', description: '', category: '', landmark: '', since: '', urgency: '', point: null, kecamatan: '', kelurahan: '', photos: [] }

/** Isi wilayah otomatis dari titik [ASUMSI: titik dalam bingkai peta mockup = Tebet / Tebet Barat]. */
const autoArea = (d: ReportDraft, p: LatLng): ReportDraft => ({ ...d, point: p, kecamatan: d.kecamatan || 'Tebet', kelurahan: d.kelurahan || 'Tebet Barat' })

export default function MS03Report() {
  const { screenState, showToast, isFallback } = useMock()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('chat')
  const [draft, setDraft] = useState<ReportDraft>(EMPTY)

  // Varian "redirect_to_form" (UI-SPEC S03-A)
  useEffect(() => {
    if (screenState === 'redirect_form') {
      showToast('Asisten sedang tidak tersedia. Kami pindahkan ceritamu ke formulir.', 'info')
      setTab('form')
    }
  }, [screenState, showToast])

  const submitted = () => {
    showToast('Laporan terkirim. Kami sedang menyiapkan label awal.')
    navigate('/laporan/1?baru=1')
  }

  return (
    <>
      <AppBar title="Lapor" />
      <ScreenBody>
        <SegmentedTabs
          label="Cara melapor"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'chat', label: 'Ceritakan' },
            { key: 'form', label: 'Formulir' },
          ]}
        />
        {tab === 'chat' ? (
          <ChatTab draft={draft} setDraft={setDraft} isFallback={isFallback} onToForm={() => setTab('form')} onSubmit={submitted} />
        ) : (
          <FormTab draft={draft} setDraft={setDraft} onSubmit={submitted} />
        )}
      </ScreenBody>
    </>
  )
}

/* ---------------- S03-A Tab chat (ChatReporter) ---------------- */

function ChatTab({
  draft,
  setDraft,
  isFallback,
  onToForm,
  onSubmit,
}: {
  draft: ReportDraft
  setDraft: (d: ReportDraft) => void
  isFallback: boolean
  onToForm: () => void
  onSubmit: () => void
}) {
  const { screenState } = useMock()
  const [messages, setMessages] = useState<Msg[]>([{ from: 'system', text: 'Ceritakan masalah yang kamu lihat. Sebutkan di mana dan sejak kapan, ya.' }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState<ChatExtract | null>(null)
  const listEnd = useRef<HTMLDivElement>(null)

  // Varian dari panel dev
  const forcedThinking = screenState === 'ai_berpikir'
  const forced: ChatExtract | null =
    screenState === 'off_topic' ? simulateChat('halo apa kabar') : screenState === 'darurat' ? simulateChat('ada kabel listrik putus menjuntai') : null
  const active = forced ?? result
  const rateLimited = screenState === '429'

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'end' })
  }, [messages, thinking])

  const send = () => {
    const text = input.trim()
    if (!text || thinking || rateLimited) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setThinking(true)
    window.setTimeout(() => {
      const r = simulateChat(text)
      setThinking(false)
      setResult(r)
      setMessages((m) => [...m, { from: 'ai', text: r.pertanyaan_lanjutan ?? '' }])
      if (r.status !== 'off_topic') {
        setDraft({
          ...draft,
          title: r.draft.judul ?? draft.title,
          description: r.draft.ringkasan ?? draft.description,
          category: r.draft.kategori ?? draft.category,
          landmark: r.draft.lokasi_teks ?? draft.landmark,
          since: r.draft.sejak ?? draft.since,
          urgency: r.draft.urgensi_saran ?? draft.urgency,
        })
      }
    }, 900)
  }

  const shownMessages = forced ? [...messages, { from: 'ai' as const, text: forced.pertanyaan_lanjutan ?? '' }] : messages
  const showDraft = active && active.status !== 'off_topic'
  const missing = [
    ...(active?.field_kurang.filter((f) => f !== 'titik_peta' && f !== 'foto') ?? []),
    ...(!draft.point ? (['titik_peta'] as const) : []),
    ...(draft.photos.length === 0 ? (['foto'] as const) : []),
  ]
  const canSubmit = draft.description.trim().length >= 20 && !!draft.category && !!draft.point && !!draft.kelurahan
  const aiSource = isFallback ? 'aturan' : 'gemini'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2" aria-live="polite">
        {shownMessages.map((m, i) => (
          <div key={i} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', m.from === 'user' ? 'rounded-br-md bg-brand-blue text-white' : 'rounded-bl-md bg-surface text-ink')}>
              {m.text}
              {m.from === 'ai' && (
                <div className="mt-2">
                  <AiBadge source={aiSource} />
                </div>
              )}
            </div>
          </div>
        ))}
        {(thinking || forcedThinking) && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-sm text-muted" aria-busy="true">
              …<span className="sr-only">Sedang menyusun draf</span>
            </div>
          </div>
        )}
        <div ref={listEnd} />
      </div>

      {active?.draft.urgensi_saran === 'darurat' && (
        <NoticeBox tone="red" icon={<Siren size={16} className="text-accent-red" />}>
          Ini terdengar darurat. Segera hubungi 112. Setelah aman, kamu bisa lanjutkan laporan di sini.
        </NoticeBox>
      )}
      {rateLimited && <NoticeBox tone="amber">Kamu mengirim terlalu cepat. Tunggu sebentar, ya.</NoticeBox>}

      <div className="flex items-end gap-2">
        <TextArea
          aria-label="Pesan"
          placeholder="Contoh: Di lahan kosong samping musala sampah numpuk seminggu…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-11 flex-1 bg-surface"
          rows={2}
        />
        <Button variant="small" icon={<Send size={16} />} onClick={send} disabled={!input.trim() || thinking || rateLimited} className="min-h-11">
          Kirim
        </Button>
      </div>

      {showDraft && (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-ink">Draf laporan</h2>
            <Badge tone="ai" icon={Sparkles}>
              Disusun oleh AI — periksa sebelum kirim
            </Badge>
          </div>
          <Field label="Judul">{(id) => <TextInput id={id} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}</Field>
          <Field label="Ringkasan">{(id) => <TextArea id={id} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />}</Field>
          <Field label="Kategori">
            {(id) => (
              <Select id={id} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Patokan lokasi">{(id) => <TextInput id={id} value={draft.landmark} onChange={(e) => setDraft({ ...draft, landmark: e.target.value })} />}</Field>
          <Field label="Sejak">{(id) => <TextInput id={id} value={draft.since} onChange={(e) => setDraft({ ...draft, since: e.target.value })} />}</Field>
          <Field label="Urgensi (saran)">
            {(id) => (
              <Select id={id} value={draft.urgency} onChange={(e) => setDraft({ ...draft, urgency: e.target.value as Urgency })}>
                <option value="">—</option>
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {URGENCY_LABEL[u]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {missing.length > 0 && <p className="text-sm text-ink-2">Masih kurang: {missing.map((m) => MISSING_LABEL[m]).join(', ')}</p>}

          <PointPicker label="Tandai titik lokasi di peta" value={draft.point} onChange={(p) => setDraft(autoArea(draft, p))} />
          <AreaSelect kecamatan={draft.kecamatan} kelurahan={draft.kelurahan} onChange={(kec, kel) => setDraft({ ...draft, kecamatan: kec, kelurahan: kel })} />
          <PhotoPicker label="Tambah foto (maks 3)" photos={draft.photos} onChange={(photos) => setDraft({ ...draft, photos })} allowBlur />
          <Button variant="confirm" disabled={!canSubmit} onClick={onSubmit}>
            Kirim laporan
          </Button>
          <Button variant="link" onClick={onToForm} className="self-center">
            Pindah ke formulir
          </Button>
        </Card>
      )}
    </div>
  )
}

/* ---------------- S03-B Tab formulir (ReportForm) ---------------- */

function FormTab({ draft, setDraft, onSubmit }: { draft: ReportDraft; setDraft: (d: ReportDraft) => void; onSubmit: () => void }) {
  const { screenState } = useMock()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const refs = useRef<Record<string, HTMLElement | null>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!draft.category) e.category = 'Pilih kategori'
    if (draft.description.trim().length < 20) e.description = 'Deskripsi minimal 20 karakter'
    if (draft.title && draft.title.trim().length < 5) e.title = 'Judul minimal 5 karakter'
    if (screenState === 'luar_dki') e.point = 'Lokasi di luar wilayah pilot DKI Jakarta'
    else if (!draft.point) e.point = 'Tandai lokasi di peta'
    else if (!isInsideDki(draft.point)) e.point = 'Lokasi di luar wilayah pilot DKI Jakarta'
    if (!draft.kelurahan) e.kelurahan = 'Pilih kelurahan'
    if (screenState === 'foto_besar') e.photos = 'Ukuran foto maksimal 5 MB'
    if (screenState === 'foto_format') e.photos = 'Format foto harus JPG, PNG, atau WebP'
    setErrors(e)
    // Fokus pindah ke field pertama yang salah (UI-SPEC §0 "Validasi")
    const first = ['category', 'description', 'title', 'point', 'kelurahan', 'photos'].find((k) => e[k])
    if (first) refs.current[first]?.scrollIntoView({ block: 'center' })
    if (first) (refs.current[first]?.querySelector('input,textarea,select,button') as HTMLElement | null)?.focus()
    return !first
  }

  return (
    <Card className="flex flex-col gap-4">
      <div ref={(el) => { refs.current.category = el }} className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-2" id="cat-label">
          Kategori masalah
        </span>
        <div role="radiogroup" aria-labelledby="cat-label" className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c]
            const on = draft.category === c
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setDraft({ ...draft, category: c })}
                className={cn('flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold', on ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-line bg-surface-2 text-ink')}
              >
                <Icon size={18} aria-hidden /> {CATEGORY_LABEL[c]}
              </button>
            )
          })}
        </div>
        {errors.category && <p className="text-xs font-semibold text-accent-red">{errors.category}</p>}
      </div>

      <div ref={(el) => { refs.current.description = el }}>
        <Field label="Ceritakan masalahnya" error={errors.description}>
          {(id, d) => (
            <TextArea id={id} aria-describedby={d} invalid={!!errors.description} maxLength={2000} placeholder="Apa yang terjadi, sejak kapan, dan dampaknya bagi warga" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          )}
        </Field>
      </div>
      <div ref={(el) => { refs.current.title = el }}>
        <Field label="Judul singkat (opsional)" error={errors.title}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.title} maxLength={200} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}
        </Field>
      </div>
      <div ref={(el) => { refs.current.point = el }}>
        <PointPicker label="Lokasi masalah" value={draft.point} onChange={(p) => setDraft(autoArea(draft, p))} error={errors.point} />
      </div>
      <div ref={(el) => { refs.current.kelurahan = el }}>
        <AreaSelect kecamatan={draft.kecamatan} kelurahan={draft.kelurahan} onChange={(kec, kel) => setDraft({ ...draft, kecamatan: kec, kelurahan: kel })} error={errors.kelurahan} />
      </div>
      <Field label="Patokan (opsional)">
        {(id) => <TextInput id={id} maxLength={300} placeholder="Contoh: samping Musala Al-Ikhlas RT 03" value={draft.landmark} onChange={(e) => setDraft({ ...draft, landmark: e.target.value })} />}
      </Field>
      <div ref={(el) => { refs.current.photos = el }}>
        <PhotoPicker label="Foto (opsional, maks 3, JPG/PNG/WebP ≤ 5 MB)" photos={draft.photos} onChange={(photos) => setDraft({ ...draft, photos })} error={errors.photos} />
      </div>
      <NoticeBox tone="blue">Data lokasi (EXIF) di foto akan dihapus otomatis. Jangan unggah foto wajah orang lain.</NoticeBox>
      <Button variant="confirm" onClick={() => validate() && onSubmit()}>
        Kirim laporan
      </Button>
    </Card>
  )
}
