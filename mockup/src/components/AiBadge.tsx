/**
 * Lencana AI & tombol "Kenapa?" — UI-SPEC §0 "Lencana AI":
 * AiBadge: "Saran AI" (gemini) · "Saran AI (tersimpan)" (cache) · "Aturan otomatis" (aturan).
 * AiReason: "Kenapa?" → popover berisi alasan, "Tingkat keyakinan: rendah/sedang/tinggi",
 * tautan "Pelajari cara kerja AI" → /tentang-ai.
 * Mockup TIDAK memanggil AI sungguhan; semua teks dari data lokal.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AI_SOURCE_LABEL, TEXT, confidenceWord, type AiSource } from '../lib/labels'
import { AI_SOURCE_META } from '../lib/statusMeta'
import { useMock } from '../app/MockContext'
import { Badge } from './StatusChip'

/** Sumber efektif: saat mode cadangan aktif, keluaran Gemini diganti aturan (AI-PROMPTS §7). */
export function useAiSource(source: AiSource): AiSource {
  const { isFallback } = useMock()
  return isFallback && source === 'gemini' ? 'aturan' : source
}

export function AiBadge({ source }: { source: AiSource }) {
  const effective = useAiSource(source)
  const meta = AI_SOURCE_META[effective]
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {AI_SOURCE_LABEL[effective]}
    </Badge>
  )
}

export function AiReason({ reason, confidence }: { reason: string; confidence: number }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="min-h-11 cursor-pointer text-left text-xs font-bold text-ai underline-offset-2 hover:underline"
      >
        {TEXT.whyButton}
      </button>
      {open && (
        <span role="note" className="mt-1 flex flex-col gap-1.5 rounded-xl border border-ai/30 bg-ai/10 p-3 text-xs text-ink">
          <span>{reason}</span>
          <span className="font-semibold">{TEXT.confidence(confidenceWord(confidence))}</span>
          <Link to="/tentang-ai" className="font-bold text-ai underline">
            {TEXT.learnAi}
          </Link>
        </span>
      )}
    </span>
  )
}
