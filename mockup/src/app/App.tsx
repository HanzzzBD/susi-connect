/**
 * Root mockup Android SUSI Connect: provider state, router, bingkai perangkat, panel dev.
 * Tidak ada request jaringan: semua data dari src/data, font dibundel, tanpa tile peta.
 */
import { Fragment, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DevPanel } from './DevPanel'
import { DeviceFrame } from './DeviceFrame'
import { MockProvider, useMock } from './MockContext'
import { homeFor } from './navigation'
import { SCREENS, type ScreenMeta } from './screens'
import Forbidden from '../screens/system/Forbidden'
import NotFound from '../screens/system/NotFound'

/** Penjaga peran (setara RequireAuth SDD §8A.4): tamu → /login?next=, peran lain → 403. */
function Guard({ meta, children }: { meta: ScreenMeta; children: ReactNode }) {
  const { persona } = useMock()
  const { pathname, search } = useLocation()
  const needsLogin = meta.login || (meta.personas && !meta.personas.includes('tamu'))
  if (persona === 'tamu' && needsLogin) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
  if (meta.personas && !meta.personas.includes(persona)) return <Forbidden roles={meta.personas} />
  // key = URL penuh: state lokal layar di-reset saat pindah ke data lain (mis. /aksi/4 → /aksi/3)
  return <Fragment key={pathname + search}>{children}</Fragment>
}

/** State layar kembali ke "sukses" setiap pindah halaman. */
function ResetStateOnNavigate() {
  const { pathname } = useLocation()
  const { setScreenState } = useMock()
  useEffect(() => {
    setScreenState('sukses')
  }, [pathname, setScreenState])
  return null
}

function Home() {
  const { persona } = useMock()
  return <Navigate to={homeFor(persona)} replace />
}

export default function App() {
  return (
    <MockProvider>
      <BrowserRouter>
        <ResetStateOnNavigate />
        <div className="flex min-h-dvh items-start justify-center gap-6 min-[440px]:p-6">
          <DevPanel />
          <DeviceFrame>
            <Routes>
              <Route path="/" element={<Home />} />
              {SCREENS.map((s) => (
                <Route key={s.path} path={s.path} element={<Guard meta={s}>{s.element}</Guard>} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DeviceFrame>
        </div>
      </BrowserRouter>
    </MockProvider>
  )
}
