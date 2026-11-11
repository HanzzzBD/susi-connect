/**
 * Input bersama:
 * - usePermission: alur penjelasan izin → hasil (UI-SPEC M "Teks izin perangkat").
 * - PointPicker: peta mockup + "Pakai lokasi saya" (S03 #5, S09 #5/#6).
 * - AreaSelect: dropdown "Kecamatan" / "Kelurahan" (Z3) — PRD §12.1.
 * - PhotoPicker: "Ambil foto" (kamera) & "Pilih dari galeri" (M-S03), maks 3, opsi "Samarkan wajah/plat" (S05).
 * Varian state "izin_ditolak" memaksa semua izin ditolak.
 */
import { Camera, EyeOff, Image as ImageIcon, LocateFixed, X } from 'lucide-react'
import { useState } from 'react'
import { useMock } from '../app/MockContext'
import { AREAS } from '../data/areas'
import { L00 } from '../data/reports'
import type { LatLng } from '../data/types'
import type { PermissionKind } from '../lib/labels'
import { cn } from '../lib/cn'
import { MapPlaceholder } from './MapPlaceholder'
import { PermissionDialog, permissionDenied } from './PermissionDialog'
import { PhotoPlaceholder } from './ReportParts'
import { Button } from './ui/Button'
import { Field, Select } from './ui/Input'

export function usePermission() {
  const { screenState, showToast } = useMock()
  const [asking, setAsking] = useState<{ kind: PermissionKind; onGranted: () => void; onDenied?: () => void } | null>(null)
  const [granted, setGranted] = useState<PermissionKind[]>([])

  const request = (kind: PermissionKind, onGranted: () => void, onDenied?: () => void) => {
    if (screenState === 'izin_ditolak') {
      showToast(permissionDenied(kind), 'info')
      onDenied?.()
      return
    }
    if (granted.includes(kind)) return onGranted()
    setAsking({ kind, onGranted, onDenied })
  }

  const dialog = (
    <PermissionDialog
      kind={asking?.kind ?? null}
      onResult={(kind, ok) => {
        const a = asking
        setAsking(null)
        if (ok) {
          setGranted((g) => [...g, kind])
          a?.onGranted()
        } else {
          showToast(permissionDenied(kind), 'info')
          a?.onDenied?.()
        }
      }}
    />
  )
  return { request, dialog }
}

export function PointPicker({
  label,
  value,
  onChange,
  error,
  myLocation = L00,
}: {
  label: string
  value: LatLng | null
  onChange: (p: LatLng) => void
  error?: string | null
  /** Lokasi GPS simulasi (default titik demo L00). */
  myLocation?: LatLng
}) {
  const { request, dialog } = usePermission()
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <MapPlaceholder className={cn('h-40 rounded-xl border', error ? 'border-accent-red' : 'border-transparent')} picked={value} onTap={onChange} />
      <Button variant="outline" icon={<LocateFixed size={16} />} onClick={() => request('lokasi', () => onChange(myLocation))}>
        Pakai lokasi saya
      </Button>
      {value && (
        <span className="text-xs text-muted">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </span>
      )}
      {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
      {dialog}
    </div>
  )
}

export function AreaSelect({
  kecamatan,
  kelurahan,
  onChange,
  error,
}: {
  kecamatan: string
  kelurahan: string
  onChange: (kec: string, kel: string) => void
  error?: string | null
}) {
  const kels = AREAS.find((a) => a.kecamatan === kecamatan)?.kelurahan ?? []
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="Kecamatan">
        {(id) => (
          <Select id={id} value={kecamatan} onChange={(e) => onChange(e.target.value, '')}>
            <option value="">—</option>
            {AREAS.map((a) => (
              <option key={a.kecamatan} value={a.kecamatan}>
                {a.kecamatan}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Kelurahan" error={error}>
        {(id, d) => (
          <Select id={id} aria-describedby={d} invalid={!!error} value={kelurahan} onChange={(e) => onChange(kecamatan, e.target.value)}>
            <option value="">—</option>
            {kels.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  )
}

export interface PickedPhoto {
  id: number
  source: 'kamera' | 'galeri'
  blurred: boolean
}

export function PhotoPicker({
  label,
  photos,
  onChange,
  max = 3,
  allowBlur,
  error,
}: {
  label: string
  photos: PickedPhoto[]
  onChange: (p: PickedPhoto[]) => void
  max?: number
  allowBlur?: boolean
  error?: string | null
}) {
  const { request, dialog } = usePermission()
  const add = (source: 'kamera' | 'galeri') => request(source, () => onChange([...photos, { id: Date.now(), source, blurred: false }]))
  const full = photos.length >= max
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.id} className="relative flex flex-col gap-1">
              <PhotoPlaceholder alt={`Foto ${i + 1} (sintetis)`} caption={p.blurred ? 'Disamarkan' : `Foto ${i + 1}`} className={cn('h-20', p.blurred && 'opacity-60')} />
              <button type="button" aria-label={`Hapus foto ${i + 1}`} onClick={() => onChange(photos.filter((x) => x.id !== p.id))} className="absolute right-0 top-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-ink">
                <X size={14} />
              </button>
              {allowBlur && (
                <button
                  type="button"
                  aria-pressed={p.blurred}
                  onClick={() => onChange(photos.map((x) => (x.id === p.id ? { ...x, blurred: !x.blurred } : x)))}
                  className={cn('inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold', p.blurred ? 'bg-brand-blue text-white' : 'bg-surface-2 text-ink-2')}
                >
                  <EyeOff size={12} aria-hidden /> Samarkan wajah/plat
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" icon={<Camera size={16} />} disabled={full} onClick={() => add('kamera')}>
          Ambil foto
        </Button>
        <Button variant="outline" icon={<ImageIcon size={16} />} disabled={full} onClick={() => add('galeri')}>
          Pilih dari galeri
        </Button>
      </div>
      {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
      {dialog}
    </div>
  )
}
