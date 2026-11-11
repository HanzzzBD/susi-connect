/**
 * M-S16 Notifikasi — UI-SPEC S16: judul, "Tandai semua dibaca", daftar (judul, isi, waktu, titik biru bila belum dibaca;
 * klik → link). Kosong: "Belum ada notifikasi." Isi notifikasi = [ASUMSI] (data/notifications.ts).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { EmptyState, StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { NOW } from '../data/clock'
import { NOTIFICATIONS } from '../data/notifications'
import { formatRelative } from '../lib/format'

export default function MS16Notifications() {
  const { screenState, persona } = useMock()
  const navigate = useNavigate()
  const [readIds, setReadIds] = useState<number[]>([])
  const list = screenState === 'kosong' ? [] : NOTIFICATIONS.filter((n) => n.userPersona === persona)
  const isRead = (id: number, read: boolean) => read || readIds.includes(id)

  return (
    <>
      <AppBar back hideBell title="Notifikasi" />
      <ScreenBody>
        <StdStates state={screenState}>
          {list.length === 0 ? (
            <EmptyState text="Belum ada notifikasi." />
          ) : (
            <>
              <Button variant="small" className="self-end" onClick={() => setReadIds(list.map((n) => n.id))}>
                Tandai semua dibaca
              </Button>
              {list.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setReadIds((r) => [...r, n.id])
                    navigate(n.link)
                  }}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left active:opacity-80"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isRead(n.id, n.read) ? 'bg-transparent' : 'bg-brand-blue'}`} aria-label={isRead(n.id, n.read) ? undefined : 'Belum dibaca'} />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className={`text-sm text-ink ${isRead(n.id, n.read) ? 'font-semibold' : 'font-bold'}`}>{n.title}</span>
                    <span className="text-sm text-ink-2">{n.body}</span>
                    <span className="text-xs text-muted">{formatRelative(n.createdAt, NOW)}</span>
                  </span>
                </button>
              ))}
            </>
          )}
        </StdStates>
      </ScreenBody>
    </>
  )
}
