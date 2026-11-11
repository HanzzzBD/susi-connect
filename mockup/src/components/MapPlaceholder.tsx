/**
 * Pengganti MapLibre untuk mockup: kotak abu-abu bertanda "Peta (mockup)" dengan titik statis.
 * Tidak memuat tile/basemap apa pun (tanpa request jaringan).
 * - Marker laporan: bulat warna urgensi/status (DESIGN §7.3 "Marker laporan"), berdenyut bila `pulse`.
 * - Lingkaran hambatan: isi transparan warna makna.
 * - Garis rute: brand-blue lebar 4 (DESIGN §7.3 "Garis rute"); garis lurus = putus-putus.
 * - `onLongPress`: tekan lama untuk menaruh titik (UI-SPEC M-S13); `onTap`: ketuk untuk memilih titik.
 */
import { useRef, type ReactNode } from 'react'
import type { LatLng } from '../data/types'
import { cn } from '../lib/cn'
import { colors, toneHex, type Tone } from '../theme/tokens'

/** Batas tampilan: sekitar Kecamatan Tebet [ASUMSI]. */
const BOUNDS = { north: -6.205, south: -6.258, west: 106.838, east: 106.882 }
const M_PER_PCT_X = ((BOUNDS.east - BOUNDS.west) * 111_320) / 100

const toPct = (p: LatLng) => ({
  x: ((p.lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100,
  y: ((BOUNDS.north - p.lat) / (BOUNDS.north - BOUNDS.south)) * 100,
})
const fromPct = (x: number, y: number): LatLng => ({
  lat: +(BOUNDS.north - (y / 100) * (BOUNDS.north - BOUNDS.south)).toFixed(5),
  lng: +(BOUNDS.west + (x / 100) * (BOUNDS.east - BOUNDS.west)).toFixed(5),
})

export interface MapPoint {
  id: string | number
  at: LatLng
  tone: Tone
  label: string
  pulse?: boolean
  /** Bentuk berbeda untuk membedakan jenis titik (bukan hanya warna). */
  shape?: 'circle' | 'square' | 'pin'
  onClick?: () => void
}
export interface MapCircle {
  id: string | number
  at: LatLng
  radiusM: number
  tone: Tone
  label: string
}

interface Props {
  points?: MapPoint[]
  circles?: MapCircle[]
  route?: LatLng[]
  routeStraight?: boolean
  picked?: LatLng | null
  onTap?: (p: LatLng) => void
  onLongPress?: (p: LatLng) => void
  offlineBasemap?: boolean
  className?: string
  children?: ReactNode
  label?: string
}

export function MapPlaceholder({
  points = [],
  circles = [],
  route,
  routeStraight,
  picked,
  onTap,
  onLongPress,
  offlineBasemap,
  className,
  children,
  label = 'Peta (mockup)',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const longFired = useRef(false)

  const posFromEvent = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return fromPct(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={cn(
        // `relative` hanya bila pemanggil tidak memosisikan sendiri (mis. "absolute inset-0")
        !className?.includes('absolute') && 'relative',
        'select-none overflow-hidden bg-line/60',
        (onTap || onLongPress) && 'cursor-crosshair',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(${colors.surface2}66 1px, transparent 1px), linear-gradient(90deg, ${colors.surface2}66 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
      onPointerDown={(e) => {
        if (!onLongPress) return
        longFired.current = false
        const p = posFromEvent(e)
        timer.current = window.setTimeout(() => {
          longFired.current = true
          onLongPress(p)
        }, 550)
      }}
      onPointerUp={(e) => {
        window.clearTimeout(timer.current)
        if (!longFired.current && onTap && e.target === e.currentTarget) onTap(posFromEvent(e))
      }}
      onPointerLeave={() => window.clearTimeout(timer.current)}
    >
      {/* "Jalan" dekoratif agar terbaca sebagai peta */}
      <div className="pointer-events-none absolute inset-y-0 left-[38%] w-2 bg-surface/70" />
      <div className="pointer-events-none absolute inset-x-0 top-[55%] h-2 bg-surface/70" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-1.5 rotate-6 bg-surface/50" />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-ink-2">
        {label}
      </span>
      {offlineBasemap && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] text-muted">Peta dasar offline</span>
      )}

      {circles.map((c) => {
        const p = toPct(c.at)
        const r = c.radiusM / M_PER_PCT_X
        return (
          <span
            key={c.id}
            title={c.label}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${Math.max(r * 2, 4)}%`,
              aspectRatio: '1',
              background: `${toneHex[c.tone]}33`,
              borderColor: toneHex[c.tone],
            }}
          />
        )
      })}

      {route && route.length > 1 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={route.map((pt) => `${toPct(pt).x},${toPct(pt).y}`).join(' ')}
            fill="none"
            stroke={colors.brandBlue}
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={routeStraight ? '8 6' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {points.map((pt) => {
        const p = toPct(pt.at)
        const shape = pt.shape ?? 'circle'
        const Tag = pt.onClick ? 'button' : 'span'
        return (
          <Tag
            key={pt.id}
            type={pt.onClick ? 'button' : undefined}
            onClick={pt.onClick}
            aria-label={pt.label}
            title={pt.label}
            className={cn('absolute -translate-x-1/2 -translate-y-1/2', pt.onClick && 'cursor-pointer p-2')}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {pt.pulse && <span className="marker-pulse absolute inset-0 m-auto h-6 w-6 rounded-full" style={{ background: `${toneHex[pt.tone]}55` }} />}
            <span
              className={cn('relative block h-4 w-4 border-2 border-white shadow', shape === 'circle' && 'rounded-full', shape === 'square' && 'rounded-sm', shape === 'pin' && 'h-5 w-5 rounded-full rounded-br-none rotate-45')}
              style={{ background: toneHex[pt.tone] }}
            />
          </Tag>
        )
      })}

      {picked && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${toPct(picked).x}%`, top: `${toPct(picked).y}%` }}
          aria-label="Titik dipilih"
        >
          <span className="block h-6 w-6 rotate-45 rounded-full rounded-br-none border-2 border-white bg-brand-blue shadow-md" />
        </span>
      )}

      {children}
    </div>
  )
}

/** Cek sederhana "dalam DKI" untuk validasi titik [ASUMSI: kotak batas kasar DKI daratan]. */
export function isInsideDki(p: LatLng) {
  return p.lat <= -6.08 && p.lat >= -6.38 && p.lng >= 106.68 && p.lng <= 106.98
}
