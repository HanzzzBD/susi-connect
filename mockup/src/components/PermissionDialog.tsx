/**
 * Penjelasan izin perangkat SEBELUM dialog sistem — UI-SPEC M "Teks izin perangkat" & "Izin notifikasi push".
 * Mockup mensimulasikan hasil dialog sistem dengan dua tombol.
 * [ASUMSI] teks tombol "Lanjutkan" / "Jangan izinkan" tidak ditentukan UI-SPEC.
 */
import { Bell, Camera, Image, MapPin } from 'lucide-react'
import { PERMISSION_TEXT, type PermissionKind } from '../lib/labels'
import { Dialog } from './Dialog'
import { Button } from './ui/Button'

const ICON = { lokasi: MapPin, kamera: Camera, galeri: Image, notifikasi: Bell } as const
const TITLE: Record<PermissionKind, string> = {
  lokasi: 'Izin lokasi',
  kamera: 'Izin kamera',
  galeri: 'Izin galeri',
  notifikasi: 'Izin notifikasi',
}

export function PermissionDialog({
  kind,
  onResult,
}: {
  kind: PermissionKind | null
  onResult: (kind: PermissionKind, granted: boolean) => void
}) {
  if (!kind) return null
  const Icon = ICON[kind]
  return (
    <Dialog
      open
      title={TITLE[kind]}
      onClose={() => onResult(kind, false)}
      footer={
        <>
          <Button variant="primary" onClick={() => onResult(kind, true)}>
            Lanjutkan
          </Button>
          <Button variant="outline" onClick={() => onResult(kind, false)}>
            Jangan izinkan
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
          <Icon size={28} aria-hidden />
        </span>
        <p className="text-sm text-ink">{PERMISSION_TEXT[kind].explain}</p>
      </div>
    </Dialog>
  )
}

/** Teks bila izin ditolak. */
export const permissionDenied = (kind: PermissionKind) => PERMISSION_TEXT[kind].denied
