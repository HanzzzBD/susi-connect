/**
 * Token mobile DESIGN.md §7.1 sebagai konstanta TS (dipakai untuk SVG peta placeholder & ikon).
 * Kelas Tailwind memakai nama yang sama (lihat theme/index.css).
 */
export const colors = {
  night: '#001C43',
  surface: '#F8FAFC',
  surface2: '#F4F4F0',
  line: '#D4D4D4',
  muted: '#737373',
  ink: '#0A0A0A',
  ink2: '#404040',
  brandBlue: '#0F3FC1',
  brandBlueDark: '#0F3F80',
  brandGreen: '#018959',
  brandOrange: '#FC9D33',
  accentRed: '#DC2626',
  accentGreen: '#00B074',
  accentOrange: '#F59E0B',
  ai: '#7C3AED',
} as const

/** Ukuran bingkai perangkat (rasio mendekati Pixel). */
export const DEVICE = { width: 390, height: 844 } as const

/**
 * Nada warna makna (DESIGN §7.1 "Warna makna di mobile"):
 * red = darurat/ditolak/bahaya · orange = tinggi · amber = sedang/menunggu bukti/cadangan ·
 * green = rendah/selesai · blue = instansi · ai = keluaran AI · neutral/ink = status netral.
 */
export type Tone = 'neutral' | 'ink' | 'red' | 'orange' | 'amber' | 'green' | 'blue' | 'ai'

/** Resep "Lencana status" DESIGN §7.3: bg-<warna>/15 + teks <warna>. */
export const toneChip: Record<Tone, string> = {
  neutral: 'bg-muted/15 text-ink-2',
  ink: 'bg-ink/10 text-ink',
  red: 'bg-accent-red/15 text-accent-red',
  orange: 'bg-brand-orange/20 text-ink',
  amber: 'bg-accent-orange/20 text-ink',
  green: 'bg-accent-green/15 text-brand-green',
  blue: 'bg-brand-blue/15 text-brand-blue',
  ai: 'bg-ai/15 text-ai',
}

/** Warna ikon per nada (ikon tetap berwarna walau teks digelapkan demi kontras). */
export const toneIcon: Record<Tone, string> = {
  neutral: 'text-muted',
  ink: 'text-ink-2',
  red: 'text-accent-red',
  orange: 'text-brand-orange',
  amber: 'text-accent-orange',
  green: 'text-accent-green',
  blue: 'text-brand-blue',
  ai: 'text-ai',
}

export const toneHex: Record<Tone, string> = {
  neutral: colors.muted,
  ink: colors.ink2,
  red: colors.accentRed,
  orange: colors.brandOrange,
  amber: colors.accentOrange,
  green: colors.accentGreen,
  blue: colors.brandBlue,
  ai: colors.ai,
}
