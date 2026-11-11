/**
 * M0 "Lainnya" — UI-SPEC M0: Notifikasi, Dampak, Tentang AI, Bantuan (chatbot), Pengaturan server, Keluar.
 * Admin: + Kanal instansi, Laporan ditolak (UI-SPEC M0 & M-S22).
 */
import type { LucideIcon } from 'lucide-react'
import { Bell, ChartColumn, ChevronRight, Landmark, LogOut, MessageCircle, Server, Sparkles, FileX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { Card } from '../components/ui/Card'

interface Item {
  label: string
  icon: LucideIcon
  to?: string
  onClick?: () => void
}

export default function M0More() {
  const navigate = useNavigate()
  const { persona, setPersona, userName } = useMock()

  const adminItems: Item[] =
    persona === 'admin'
      ? [
          { label: 'Kanal instansi', icon: Landmark, to: '/admin/kanal' },
          { label: 'Laporan ditolak', icon: FileX, to: '/admin/ditolak' },
        ]
      : []
  const items: Item[] = [
    ...adminItems,
    { label: 'Notifikasi', icon: Bell, to: '/notifikasi' },
    { label: 'Dampak', icon: ChartColumn, to: '/dampak' },
    { label: 'Tentang AI', icon: Sparkles, to: '/tentang-ai' },
    { label: 'Bantuan', icon: MessageCircle, to: '/bantuan' },
    { label: 'Pengaturan server', icon: Server, to: '/pengaturan-server' },
    {
      label: 'Keluar',
      icon: LogOut,
      onClick: () => {
        setPersona('tamu')
        navigate('/login', { replace: true })
      },
    },
  ]

  return (
    <>
      <AppBar title="Lainnya" subtitle={userName ?? undefined} />
      <ScreenBody>
        <Card className="px-2 py-1">
          <ul>
            {items.map(({ label, icon: Icon, to, onClick }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={onClick ?? (() => navigate(to!))}
                  className="flex min-h-12 w-full cursor-pointer items-center gap-3 border-b border-line px-3 py-3 text-left last:border-0 active:bg-surface-2"
                >
                  <span className="rounded-xl bg-brand-blue/10 p-2 text-brand-blue">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className={label === 'Keluar' ? 'flex-1 text-sm font-semibold text-accent-red' : 'flex-1 text-sm font-semibold text-ink'}>{label}</span>
                  <ChevronRight size={18} className="text-muted" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </ScreenBody>
    </>
  )
}
