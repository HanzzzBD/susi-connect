/**
 * Panel dev (DI LUAR aplikasi): pilih persona (PRD §6 / UI-SPEC M0), state layar (UI-SPEC per layar),
 * mode cadangan & jaringan hotspot, serta lompat ke layar. State disimpan di memori, bukan localStorage.
 */
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { PERSONAS, PERSONA_LABEL } from '../lib/labels'
import { useMock } from './MockContext'
import { LOGIN_REDIRECT } from './navigation'
import { SCREENS, statesFor } from './screens'

const STATE_LABEL: Record<string, string> = { sukses: 'Sukses', memuat: 'Memuat', kosong: 'Kosong', galat: 'Galat jaringan' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </section>
  )
}

function Pill({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={cn('min-h-9 cursor-pointer rounded-lg border px-2.5 text-left text-xs font-semibold', active ? 'border-brand-blue bg-brand-blue text-white' : 'border-line bg-surface text-ink-2 hover:bg-surface-2')}
    >
      {children}
    </button>
  )
}

function PanelBody() {
  const { persona, setPersona, screenState, setScreenState, fallback, setFallback, hotspot, setHotspot } = useMock()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const current = SCREENS.find((s) => matchPath(s.path, pathname))
  const states = statesFor(current)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold text-ink">Panel dev — mockup SUSI Connect</p>
        <p className="text-xs text-muted">Bukan bagian aplikasi. Semua data sintetis, tanpa backend.</p>
      </div>

      <Section title="Persona">
        <div className="grid grid-cols-2 gap-1.5">
          {PERSONAS.map((p) => (
            <Pill
              key={p}
              active={persona === p}
              onClick={() => {
                setPersona(p)
                navigate(LOGIN_REDIRECT[p])
              }}
            >
              {PERSONA_LABEL[p]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title={`State layar${current ? ` — ${current.id} ${current.title}` : ''}`}>
        <div className="flex flex-wrap gap-1.5">
          {states.map((s) => (
            <Pill key={s} active={screenState === s} onClick={() => setScreenState(s)}>
              {STATE_LABEL[s] ?? s}
            </Pill>
          ))}
          {current?.variants?.map((v) => (
            <Pill key={v.key} active={screenState === v.key} onClick={() => setScreenState(v.key)}>
              {v.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Jaringan">
        <Pill active={fallback} onClick={() => setFallback(!fallback)}>
          Mode cadangan (AI_MODE=fallback)
        </Pill>
        <Pill active={hotspot} onClick={() => setHotspot(!hotspot)}>
          Terhubung lewat hotspot laptop
        </Pill>
      </Section>

      <Section title="Lompat ke layar">
        <ul className="flex flex-col gap-1">
          {SCREENS.filter((s) => !s.personas || s.personas.includes(persona)).map((s) => {
            const active = s.sample === pathname + search || (current === s && !!matchPath(s.path, pathname))
            return (
              <li key={s.path}>
                <button type="button" onClick={() => navigate(s.sample)} className={cn('flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-surface-2', active && 'bg-brand-blue/10')}>
                  <span className="w-16 shrink-0 font-bold text-brand-blue">{s.id}</span>
                  <span className="text-ink">{s.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}

export function DevPanel() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Layar lebar: panel samping */}
      <aside className="hidden max-h-[844px] w-72 shrink-0 overflow-y-auto rounded-2xl border border-line bg-surface p-4 lg:block">
        <PanelBody />
      </aside>
      {/* Layar sempit: tombol mengambang + laci */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka panel dev"
        className="fixed right-2 top-10 z-[100] inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg lg:hidden"
      >
        <SlidersHorizontal size={18} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-80 max-w-[90%] overflow-y-auto bg-surface p-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Tutup panel dev" onClick={() => setOpen(false)} className="mb-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted">
              <X size={18} />
            </button>
            <PanelBody />
          </div>
        </div>
      )}
    </>
  )
}
