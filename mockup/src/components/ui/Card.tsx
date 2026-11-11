/**
 * Kartu — resep DESIGN §7.3:
 * list    = "Kartu daftar" (bg-surface rounded-2xl p-4 flex-row gap-3 border border-line)
 * content = "Kartu isi"    (bg-surface px-5 py-4 rounded-2xl border border-line)
 * inner   = "Kotak di dalam kartu" (bg-surface-2 rounded-xl p-3)
 */
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

const VARIANT = {
  list: 'w-full bg-surface rounded-2xl p-4 flex items-center gap-3 border border-line',
  content: 'bg-surface w-full px-5 py-4 rounded-2xl border border-line',
  inner: 'bg-surface-2 rounded-xl p-3',
} as const

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANT
}

export function Card({ variant = 'content', className, ...rest }: Props) {
  return <div className={cn(VARIANT[variant], className)} {...rest} />
}

/** Kartu daftar yang bisa ditekan. */
export function PressableCard({
  className,
  children,
  onClick,
  label,
}: {
  className?: string
  children: ReactNode
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(VARIANT.list, 'cursor-pointer text-left active:opacity-80', className)}
    >
      {children}
    </button>
  )
}

/** Judul kartu isi. */
export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-base font-bold text-ink">{children}</h3>
      {right}
    </div>
  )
}
