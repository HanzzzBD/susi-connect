/**
 * State standar UI-SPEC §0:
 * - Memuat: skeleton sesuai bentuk konten (bukan spinner layar penuh), aria-busy="true", tanpa teks.
 * - Error jaringan: ErrorState + tombol "Coba lagi" — "Tidak bisa terhubung ke server. Pastikan backend berjalan."
 * - Kosong: resep "Kosong / galat" DESIGN §7.3 (kartu isi, ikon 32 muted, teks text-sm text-muted, tombol kecil).
 */
import { CloudOff, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { TEXT } from '../lib/labels'
import { useMock } from '../app/MockContext'
import { Button } from './ui/Button'

export type SkeletonShape = 'list' | 'detail' | 'kpi' | 'map' | 'form'

export function Skeleton({ shape = 'list' }: { shape?: SkeletonShape }) {
  const bar = 'skeleton rounded-xl bg-white/15'
  const card = 'skeleton rounded-2xl bg-surface/80 border border-line'
  return (
    <div aria-busy="true" aria-label="Memuat" className="flex flex-col gap-3">
      {shape === 'map' && <div className={`${card} h-56`} />}
      {shape === 'kpi' && (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${card} h-24`} />
          ))}
        </div>
      )}
      {shape === 'detail' && (
        <>
          <div className={`${bar} h-6 w-2/3`} />
          <div className={`${card} h-40`} />
          <div className={`${card} h-28`} />
        </>
      )}
      {shape === 'form' && [0, 1, 2, 3].map((i) => <div key={i} className={`${card} h-16`} />)}
      {(shape === 'list' || shape === 'map' || shape === 'kpi') &&
        [0, 1, 2].map((i) => (
          <div key={i} className={`${card} flex h-20 items-center gap-3 p-4`}>
            <div className="h-12 w-12 rounded-xl bg-line/70" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-3/4 rounded bg-line/70" />
              <div className="h-3 w-1/2 rounded bg-line/70" />
            </div>
          </div>
        ))}
    </div>
  )
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-6 text-center">
      <Inbox size={32} className="text-muted" aria-hidden />
      <p className="text-sm text-muted">{text}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message = TEXT.networkError, onRetry }: { message?: string; onRetry?: () => void }) {
  const { setScreenState } = useMock()
  return (
    <div role="alert" className="flex w-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-6 text-center">
      <CloudOff size={32} className="text-muted" aria-hidden />
      <p className="text-sm text-muted">{message}</p>
      <Button variant="small" onClick={onRetry ?? (() => setScreenState('sukses'))}>
        {TEXT.retry}
      </Button>
    </div>
  )
}

/**
 * Pembungkus state standar: memuat → skeleton, galat → ErrorState, kosong → EmptyState, selain itu isi.
 */
export function StdStates({
  state,
  empty,
  emptyAction,
  shape = 'list',
  children,
}: {
  state: string
  empty?: string
  emptyAction?: ReactNode
  shape?: SkeletonShape
  children: ReactNode
}) {
  if (state === 'memuat') return <Skeleton shape={shape} />
  if (state === 'galat') return <ErrorState />
  if (state === 'kosong' && empty) return <EmptyState text={empty} action={emptyAction} />
  return <>{children}</>
}
