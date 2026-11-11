/**
 * Form "Tandai hambatan" — UI-SPEC S13 #3/#4 (dipakai juga untuk "+ Usulkan hambatan" warga di M-S02, S13 #5).
 * Jenis (wajib) · titik (wajib, dalam DKI) · Radius 10–500 m (default 50) · Keterangan ≤ 300 ·
 * Berlaku sampai (default per jenis, maks 30 hari → "Maksimal 30 hari").
 */
import { useState } from 'react'
import { NOW } from '../data/clock'
import type { LatLng } from '../data/types'
import { OBSTACLE_DEFAULT_HOURS, OBSTACLE_TYPES, OBSTACLE_TYPE_LABEL, type ObstacleType } from '../lib/labels'
import { Dialog } from './Dialog'
import { MapPlaceholder, isInsideDki } from './MapPlaceholder'
import { Button } from './ui/Button'
import { Field, Select, TextArea, TextInput } from './ui/Input'

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const defaultUntil = (t: ObstacleType) => toLocalInput(new Date(NOW.getTime() + OBSTACLE_DEFAULT_HOURS[t] * 3_600_000))

export function ObstacleForm({
  open,
  initialPoint,
  title = 'Tandai hambatan',
  onClose,
  onSaved,
}: {
  open: boolean
  initialPoint: LatLng | null
  title?: string
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<ObstacleType | ''>('')
  const [point, setPoint] = useState<LatLng | null>(initialPoint)
  const [radius, setRadius] = useState(50)
  const [note, setNote] = useState('')
  const [until, setUntil] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = () => {
    const e: Record<string, string> = {}
    // [ASUMSI] pesan untuk jenis & titik tidak ditentukan UI-SPEC S13
    if (!type) e.type = 'Pilih jenis hambatan'
    if (!point) e.point = 'Tandai titik di peta'
    else if (!isInsideDki(point)) e.point = 'Lokasi di luar wilayah pilot DKI Jakarta'
    if (until && new Date(until).getTime() - NOW.getTime() > 30 * 24 * 3_600_000) e.until = 'Maksimal 30 hari'
    setErrors(e)
    if (Object.keys(e).length === 0) onSaved()
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={submit}>
          Simpan hambatan
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Jenis hambatan" error={errors.type}>
          {(id, d) => (
            <Select
              id={id}
              aria-describedby={d}
              invalid={!!errors.type}
              value={type}
              onChange={(ev) => {
                const t = ev.target.value as ObstacleType
                setType(t)
                setUntil(defaultUntil(t))
              }}
            >
              <option value="">—</option>
              {OBSTACLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {OBSTACLE_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-2">Titik</span>
          <MapPlaceholder className="h-36 rounded-xl" picked={point} onTap={setPoint} circles={point ? [{ id: 'r', at: point, radiusM: radius, tone: 'orange', label: 'Radius' }] : []} />
          {errors.point && <p className="text-xs font-semibold text-accent-red">{errors.point}</p>}
        </div>
        <Field label={`Radius (${radius} m)`}>
          {(id) => <input id={id} type="range" min={10} max={500} step={10} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-brand-blue" />}
        </Field>
        <Field label="Keterangan (opsional)">
          {(id) => <TextArea id={id} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        <Field label="Berlaku sampai" error={errors.until}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.until} type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} />}
        </Field>
      </div>
    </Dialog>
  )
}
