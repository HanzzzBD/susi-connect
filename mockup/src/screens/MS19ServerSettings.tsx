/**
 * M-S19 Pengaturan server — UI-SPEC M-S19 (#1–#5).
 * Mockup tanpa jaringan: "Uji koneksi" disimulasikan (tidak ada GET /health sungguhan).
 * Varian: tidak_terhubung. Saklar hotspot di panel dev → status hotspot.
 * [PERLU DATA] domain API ("api.<domain>") belum ditetapkan.
 */
import { useState } from 'react'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { NoticeBox } from '../components/Banners'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, TextInput } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'

export default function MS19ServerSettings() {
  const { screenState, hotspot, isFallback } = useMock()
  const [url, setUrl] = useState('')
  const [urlErr, setUrlErr] = useState<string | null>(null)
  const [autoSwitch, setAutoSwitch] = useState(true)
  const [testResult, setTestResult] = useState<string | null>(null)
  const disconnected = screenState === 'tidak_terhubung'

  const status = disconnected ? 'Tidak terhubung' : hotspot ? 'Terhubung ke: 192.168.137.1 (hotspot laptop)' : 'Terhubung ke: api.<domain> (internet)'

  const test = () => {
    if (disconnected) return setTestResult('Tidak terhubung')
    // [ASUMSI] angka simulasi — bukan hasil pengukuran
    setTestResult('Server merespons dalam 35 ms')
  }
  const checkUrl = (v: string) => {
    if (!v) return setUrlErr(null)
    try {
      const u = new URL(v)
      setUrlErr(u.protocol === 'http:' || u.protocol === 'https:' ? null : 'Format URL tidak valid')
    } catch {
      setUrlErr('Format URL tidak valid')
    }
  }

  return (
    <>
      <AppBar back title="Pengaturan server" />
      <ScreenBody>
        <Card className="flex flex-col gap-3">
          <CardTitle>Status</CardTitle>
          <p className={disconnected ? 'text-sm font-bold text-accent-red' : 'text-sm font-bold text-ink'}>{status}</p>
          <Button variant="primary" onClick={test} className="py-3.5">
            Uji koneksi
          </Button>
          {testResult && <NoticeBox tone={disconnected ? 'red' : 'green'}>{testResult}</NoticeBox>}
        </Card>
        <Card className="flex flex-col gap-3">
          <Field label="URL server manual (opsional)" error={urlErr}>
            {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!urlErr} inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} onBlur={(e) => checkUrl(e.target.value)} />}
          </Field>
          <Toggle label="Pindah otomatis ke hotspot bila internet putus" checked={autoSwitch} onChange={setAutoSwitch} />
        </Card>
        <Card>
          <p className="text-sm text-ink-2">
            {/* Nilai `ai_mode` / `routing_mode` dari Z1 (GET /health) */}
            Mode AI: {isFallback ? 'fallback' : 'live'}, Mode rute: {hotspot ? 'straight' : isFallback ? 'cache' : 'live'}
          </p>
        </Card>
      </ScreenBody>
    </>
  )
}
