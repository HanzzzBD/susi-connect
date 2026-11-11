/**
 * Bingkai perangkat Android 390×844 (rasio mendekati Pixel): status bar tiruan, banner jaringan,
 * isi layar (latar biru malam DESIGN §7.1), tab bar bawah, bilah gestur.
 * Layar lebar: frame di tengah. Layar sempit (< 440 px): frame mengikuti lebar & tinggi viewport.
 */
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { FallbackBanner, NetworkBanner } from '../components/Banners'
import { BottomNav } from '../components/BottomNav'
import { OverlayRootContext } from '../components/Overlay'
import { ToastHost } from '../components/Toast'
import { useMock } from './MockContext'
import { TABS } from './navigation'

function StatusBar() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between px-5 text-xs font-semibold text-white" aria-hidden>
      <span>09.12</span>
      <span className="flex items-center gap-1.5">
        <Signal size={13} />
        <Wifi size={13} />
        <BatteryFull size={15} />
      </span>
    </div>
  )
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  const { persona, fallback, hotspot } = useMock()
  const { pathname } = useLocation()
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
  const tabs = TABS[persona]
  const showNav = tabs.some((t) => t.path === pathname)

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-night min-[440px]:h-[844px] min-[440px]:w-[390px] min-[440px]:rounded-[44px] min-[440px]:border-[10px] min-[440px]:border-ink min-[440px]:shadow-2xl">
      <StatusBar />
      {/* Banner jaringan cadangan "di atas semua layar" (UI-SPEC M-S19); FallbackBanner (UI-SPEC §0) */}
      {hotspot ? <NetworkBanner /> : fallback ? <FallbackBanner /> : null}
      <OverlayRootContext.Provider value={overlay}>
        <main className="no-scrollbar relative flex-1 overflow-y-auto">{children}</main>
        {showNav && <BottomNav tabs={tabs} />}
      </OverlayRootContext.Provider>
      {/* Bilah gestur Android */}
      <div className={showNav ? 'flex h-5 shrink-0 items-center justify-center bg-surface' : 'flex h-5 shrink-0 items-center justify-center bg-night'} aria-hidden>
        <span className={showNav ? 'h-1 w-24 rounded-full bg-ink/60' : 'h-1 w-24 rounded-full bg-white/60'} />
      </div>
      <div ref={setOverlay} className="pointer-events-none absolute inset-0 z-40 [&>*]:pointer-events-auto" />
      <ToastHost />
    </div>
  )
}
