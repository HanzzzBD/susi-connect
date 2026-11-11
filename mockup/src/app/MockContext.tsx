/**
 * State global mockup (di memori saja — tidak memakai localStorage, sesuai brief):
 * persona aktif, state layar (sukses/memuat/kosong/galat/varian), mode cadangan, jaringan hotspot, toast.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { PERSONAS, type Persona } from '../lib/labels'
import { PERSONA_USER_ID, userById } from '../data/users'

export type ToastTone = 'success' | 'error' | 'info'
export interface ToastMsg {
  id: number
  text: string
  tone: ToastTone
}

interface MockState {
  persona: Persona
  setPersona: (p: Persona) => void
  /** 'sukses' | 'memuat' | 'kosong' | 'galat' | kunci varian khusus layar */
  screenState: string
  setScreenState: (s: string) => void
  fallback: boolean
  setFallback: (v: boolean) => void
  hotspot: boolean
  setHotspot: (v: boolean) => void
  toast: ToastMsg | null
  showToast: (text: string, tone?: ToastTone) => void
  userId: number | null
  userName: string | null
  /** Mode cadangan efektif: saklar cadangan ATAU jaringan hotspot (UI-SPEC M-S19). */
  isFallback: boolean
}

const Ctx = createContext<MockState | null>(null)

/** Bantuan dev: `?persona=warga` di URL awal memilih persona (dibaca sekali, tidak disimpan). */
function initialPersona(): Persona {
  const p = new URLSearchParams(window.location.search).get('persona')
  return (PERSONAS as readonly string[]).includes(p ?? '') ? (p as Persona) : 'tamu'
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(initialPersona)
  const [screenState, setScreenState] = useState('sukses')
  const [fallback, setFallback] = useState(false)
  const [hotspot, setHotspot] = useState(false)
  const [toast, setToast] = useState<ToastMsg | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // UI-SPEC §0: toast 4 dtk
  const showToast = useCallback((text: string, tone: ToastTone = 'success') => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), text, tone })
    timer.current = window.setTimeout(() => setToast(null), 4000)
  }, [])

  const value = useMemo<MockState>(() => {
    const userId = PERSONA_USER_ID[persona]
    return {
      persona,
      setPersona,
      screenState,
      setScreenState,
      fallback,
      setFallback,
      hotspot,
      setHotspot,
      toast,
      showToast,
      userId,
      userName: userId ? (userById(userId)?.name ?? null) : null,
      isFallback: fallback || hotspot,
    }
  }, [persona, screenState, fallback, hotspot, toast, showToast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMock(): MockState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useMock harus di dalam MockProvider')
  return v
}

/** State layar aktif yang dipilih dari panel dev. */
export const useScreenState = () => useMock().screenState
