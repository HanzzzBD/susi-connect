/**
 * Lencana kategori (label PRD §8.1). Kategori bukan status → netral (monokrom), ikon sebagai pembeda.
 */
import type { LucideIcon } from 'lucide-react'
import { Construction, Droplets, HeartHandshake, Lightbulb, Armchair, Trash, Trees } from 'lucide-react'
import { CATEGORY_LABEL, type Category } from '../lib/labels'
import { Badge } from './StatusChip'

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  sampah: Trash,
  drainase: Droplets,
  jalan_trotoar: Construction,
  penerangan: Lightbulb,
  fasilitas_umum: Armchair,
  lingkungan_lain: Trees,
  sosial: HeartHandshake,
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge tone="neutral" icon={CATEGORY_ICON[category]}>
      {CATEGORY_LABEL[category]}
    </Badge>
  )
}
