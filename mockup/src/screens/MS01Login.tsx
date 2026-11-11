/**
 * M-S01 Masuk — UI-SPEC S01 + perbedaan M: akun demo sebagai daftar tombol besar; tautan "Pengaturan server" di bawah.
 * Setelah login pertama: penjelasan izin notifikasi push (UI-SPEC M "Izin notifikasi push").
 * Varian state: gagal login, 429, demo nonaktif, memuat ("Memproses…"), galat (A3 gagal dimuat).
 */
import { Eye, EyeOff, Server } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { LOGIN_REDIRECT } from '../app/navigation'
import { NoticeBox } from '../components/Banners'
import { PermissionDialog, permissionDenied } from '../components/PermissionDialog'
import { ErrorState } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, TextInput } from '../components/ui/Input'
import { DEMO_ACCOUNTS, USERS } from '../data/users'
import type { Persona } from '../lib/labels'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MS01Login() {
  const { screenState, setPersona, showToast } = useMock()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Persona | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)

  const loading = busy || screenState === 'memuat'
  const topError =
    screenState === 'gagal' ? 'Email atau kata sandi salah.' : screenState === '429' ? 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' : formError

  const finishLogin = (p: Persona) => {
    setPersona(p)
    setPending(p) // tampilkan izin notifikasi push dulu
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!email || !EMAIL_RE.test(email) || email.length > 150) errs.email = 'Format email tidak valid'
    if (password.length < 8 || password.length > 72) errs.password = 'Kata sandi minimal 8 karakter'
    setErrors(errs)
    setFormError(null)
    if (errs.email) return emailRef.current?.focus()
    if (errs.password) return pwRef.current?.focus()
    setBusy(true)
    // Simulasi A1 — tanpa jaringan. Hanya email akun demo yang dikenali.
    window.setTimeout(() => {
      setBusy(false)
      const u = USERS.find((x) => x.email === email.trim().toLowerCase() && x.isDemo)
      if (!u) return setFormError('Email atau kata sandi salah.')
      finishLogin(u.persona)
    }, 600)
  }

  return (
    <div className="flex min-h-full flex-col gap-5 px-5 pb-8 pt-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold tracking-wide text-white/70">SUSI Connect</span>
        <h1 className="text-2xl font-bold text-white">Masuk ke SUSI Connect</h1>
        <p className="text-sm text-white/80">Laporkan masalah sekitar, temukan penangan, dan pantau sampai selesai.</p>
      </div>

      <Card>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          {topError && (
            <NoticeBox tone="red">
              <span role="alert">{topError}</span>
            </NoticeBox>
          )}
          <Field label="Email" error={errors.email}>
            {(id, d) => (
              <TextInput ref={emailRef} id={id} type="email" autoComplete="email" placeholder="nama@email.com" aria-describedby={d} invalid={!!errors.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
          </Field>
          <Field label="Kata sandi" error={errors.password}>
            {(id, d) => (
              <div className="relative">
                <TextInput ref={pwRef} id={id} type={showPw ? 'text' : 'password'} autoComplete="current-password" aria-describedby={d} invalid={!!errors.password} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-28" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-1 top-1/2 inline-flex min-h-11 -translate-y-1/2 cursor-pointer items-center gap-1 px-3 text-xs font-semibold text-brand-blue" aria-pressed={showPw}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  Tampilkan
                </button>
              </div>
            )}
          </Field>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Memproses…' : 'Masuk'}
          </Button>
        </form>
      </Card>

      {/* Kotak #6 hanya bila mode demo aktif (VITE_DEMO_MODE). Varian "demo_nonaktif" = tidak dirender. */}
      {screenState !== 'demo_nonaktif' &&
        (screenState === 'galat' ? (
          <ErrorState />
        ) : (
          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-ink">Akun demo (data sintetis)</h2>
            {DEMO_ACCOUNTS.map((a) => (
              <Button key={a.persona} variant="outline" className="justify-start px-4 text-left" disabled={loading} onClick={() => finishLogin(a.persona)}>
                {a.label}
              </Button>
            ))}
          </Card>
        ))}

      <div className="flex flex-col items-center gap-2">
        <Link to="/peta" className="min-h-11 content-center text-sm font-semibold text-white underline underline-offset-4">
          Lihat peta tanpa masuk
        </Link>
        <Link to="/pengaturan-server" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-white/80 underline underline-offset-4">
          <Server size={14} aria-hidden /> Pengaturan server
        </Link>
      </div>

      <PermissionDialog
        kind={pending ? 'notifikasi' : null}
        onResult={(_, granted) => {
          const p = pending!
          setPending(null)
          if (!granted) showToast(permissionDenied('notifikasi'), 'info')
          navigate(params.get('next') ?? LOGIN_REDIRECT[p], { replace: true })
        }}
      />
    </div>
  )
}
