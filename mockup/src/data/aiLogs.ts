/**
 * Log AI (U4) untuk M-S22 — [ASUMSI] tidak ada seed log AI di PRD §12. Nilai token/latensi = null/contoh sintetis,
 * BUKAN hasil pengukuran. Tujuan (`purpose`) mengikuti nama prompt di AI-PROMPTS.md.
 */
import type { AiLog } from './types'
import { at } from './clock'

const syn = { isSynthetic: true as const }

export const AI_LOGS: AiLog[] = [
  { ...syn, id: 1, at: at(0, -2), purpose: 'triage', source: 'gemini', status: 'ok', tokens: null, latencyMs: null, corrected: false },
  { ...syn, id: 2, at: at(0, -5), purpose: 'triage', source: 'gemini', status: 'ok', tokens: null, latencyMs: null, corrected: false },
  { ...syn, id: 3, at: at(-2, -3), purpose: 'triage', source: 'aturan', status: 'fallback', tokens: null, latencyMs: null, corrected: false },
  { ...syn, id: 4, at: at(-3, -5), purpose: 'triage', source: 'gemini', status: 'ok', tokens: null, latencyMs: null, corrected: true },
  { ...syn, id: 5, at: at(-3, -2), purpose: 'agency_draft', source: 'gemini', status: 'ok', tokens: null, latencyMs: null, corrected: false },
]
