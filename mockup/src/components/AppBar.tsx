/**
 * Header layar — pola Header.tsx/TopNav.tsx app SmartRoute (DESIGN §7.3):
 * judul putih di atas latar biru malam, tombol kembali bulat, lonceng notifikasi di kanan (UI-SPEC M0).
 */
import { ArrowLeft, Bell } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { NOTIFICATIONS } from '../data/notifications'
import { IconButton } from './ui/Button'

interface Props {
  title: string
  subtitle?: ReactNode
  back?: boolean
  /** Sembunyikan lonceng (mis. di layar Notifikasi sendiri). */
  hideBell?: boolean
  right?: ReactNode
}

export function AppBar({ title, subtitle, back, hideBell, right }: Props) {
  const navigate = useNavigate()
  const { persona } = useMock()
  const unread = NOTIFICATIONS.some((n) => n.userPersona === persona && !n.read)
  return (
    <header className="flex items-center gap-3 px-4 pb-3 pt-2">
      {back && (
        <IconButton label="Kembali" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-white">{title}</h1>
        {subtitle && <div className="truncate text-xs text-white/75">{subtitle}</div>}
      </div>
      {right}
      {persona !== 'tamu' && !hideBell && (
        <IconButton label="Notifikasi" onClick={() => navigate('/notifikasi')} className="relative">
          <Bell size={20} />
          {unread && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-blue ring-2 ring-surface" aria-label="Ada notifikasi belum dibaca" />}
        </IconButton>
      )}
    </header>
  )
}

/** Isi layar dengan padding standar di atas latar biru malam. */
export function ScreenBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-3 px-4 pb-6 ${className}`}>{children}</div>
}

/** Judul bagian di atas latar biru malam. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="mt-2 text-sm font-bold text-white">{children}</h2>
}
