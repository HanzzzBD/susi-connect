/**
 * M-S18 Bantuan — UI-SPEC S18 + M: chatbot = layar sendiri di "Lainnya → Bantuan".
 * Jawaban dari contoh AI-PROMPTS §6.1 (lib/mockAi.ts) — tidak memanggil AI. Riwayat ≤ 6 giliran di state komponen.
 * Varian: 429. Mode cadangan → AiBadge "Aturan otomatis".
 * [PERLU DATA] judul bagian FAQ (faq.md belum ada) — "Sumber:" menampilkan id rujukan.
 */
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AiBadge } from '../components/AiBadge'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox } from '../components/Banners'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { TextInput } from '../components/ui/Input'
import { cn } from '../lib/cn'
import { simulateFaq, type FaqAnswer } from '../lib/mockAi'

interface Turn {
  q: string
  a: FaqAnswer
}
const SUGGESTIONS = ['Bagaimana cara melapor?', 'Kenapa laporanku belum diproses?', 'Apa itu data sintetis?']

export default function MS18Help() {
  const { screenState, isFallback } = useMock()
  const navigate = useNavigate()
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const limited = screenState === '429'

  const ask = (q: string) => {
    const t = q.trim()
    if (t.length < 3 || t.length > 500) return setErr('Pertanyaan 3–500 karakter') // [ASUMSI] teks validasi
    if (limited) return
    setErr(null)
    setTurns((ts) => [...ts, { q: t, a: simulateFaq(t) }].slice(-6))
    setInput('')
  }

  return (
    <>
      <AppBar back title="Bantuan SUSI" subtitle="Tanya seputar cara memakai aplikasi." />
      <ScreenBody>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} onDark onClick={() => ask(s)}>
              {s}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-2" aria-live="polite">
          {turns.map((t, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-blue px-4 py-3 text-sm text-white">{t.q}</div>
              <div className={cn('max-w-[90%] rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-sm text-ink')}>
                <p>{t.a.jawaban}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AiBadge source={isFallback ? 'aturan' : 'gemini'} />
                  {t.a.rujukan_faq.length > 0 && <span className="text-xs text-muted">Sumber: {t.a.rujukan_faq.join(', ')}</span>}
                </div>
                {t.a.niat_melapor && (
                  <Button variant="small" className="mt-2" onClick={() => navigate('/lapor')}>
                    Lapor lewat chat
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {limited && <NoticeBox tone="amber">Kamu bertanya terlalu cepat. Tunggu sebentar, ya.</NoticeBox>}

        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <TextInput aria-label="Pertanyaan" placeholder="Tulis pertanyaanmu…" maxLength={500} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} className="bg-surface" />
            {err && <p className="text-xs font-semibold text-white">{err}</p>}
          </div>
          <Button variant="small" icon={<Send size={16} />} onClick={() => ask(input)} disabled={limited} className="min-h-11" aria-label="Kirim">
            Kirim
          </Button>
        </div>
      </ScreenBody>
    </>
  )
}
