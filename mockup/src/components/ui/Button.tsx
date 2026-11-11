/**
 * Tombol — resep DESIGN §7.3:
 * primary  = "Tombol utama"  (bg-brand-blue py-4 rounded-2xl, teks putih tebal)
 * confirm  = "Tombol konfirmasi" (bg-brand-green py-3.5 rounded-2xl) — Kirim laporan, Sah, Saya sudah tiba
 * small    = "Tombol kecil"  (bg-brand-blue px-5 py-2.5 rounded-xl)
 * outline / danger / link = turunan [ASUMSI]; teks putih hanya di atas biru/hijau (DESIGN §7.4).
 * Target sentuh ≥ 44 px, umpan balik active:opacity.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'confirm' | 'small' | 'outline' | 'danger' | 'link'

const VARIANT: Record<Variant, string> = {
  primary: 'w-full bg-brand-blue py-4 rounded-2xl text-white font-bold active:opacity-90',
  confirm: 'w-full bg-brand-green py-3.5 rounded-2xl text-white font-bold active:opacity-80',
  small: 'bg-brand-blue px-5 py-2.5 rounded-xl text-white font-semibold text-sm active:opacity-80',
  outline: 'w-full bg-surface py-3.5 rounded-2xl border border-line text-ink font-semibold active:opacity-80',
  danger: 'w-full bg-surface py-3.5 rounded-2xl border border-accent-red/40 text-accent-red font-semibold active:opacity-80',
  link: 'text-brand-blue font-semibold text-sm underline-offset-2 hover:underline px-1',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
}

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 text-center transition-opacity',
        'disabled:cursor-not-allowed disabled:opacity-100',
        VARIANT[variant],
        variant !== 'link' && 'disabled:bg-line disabled:text-muted disabled:border-line',
        variant === 'link' && 'disabled:text-muted',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

/** "Tombol ikon bulat" DESIGN §7.3 — wajib `label` (accessibilityLabel berbahasa Indonesia). */
export function IconButton({
  label,
  children,
  className,
  floating,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; floating?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-surface text-ink active:opacity-80',
        floating ? 'p-3 shadow-md' : 'border border-line p-2.5',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
