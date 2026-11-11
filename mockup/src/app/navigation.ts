/**
 * Tab bawah per persona — UI-SPEC M0 (persis urutan & nama).
 * "Lainnya" = Notifikasi, Dampak, Tentang AI, Bantuan (chatbot), Pengaturan server, Keluar.
 */
import type { LucideIcon } from 'lucide-react'
import {
  ChartColumn,
  Construction,
  FileText,
  Images,
  Landmark,
  ListOrdered,
  LogIn,
  Map as MapIcon,
  Menu,
  Megaphone,
  Route,
  ScrollText,
  ShieldCheck,
  Users,
  UsersRound,
  HandHeart,
} from 'lucide-react'
import type { Persona } from '../lib/labels'

export interface TabDef {
  label: string
  path: string
  icon: LucideIcon
}

const T = {
  peta: { label: 'Peta', path: '/peta', icon: MapIcon },
  dampak: { label: 'Dampak', path: '/dampak', icon: ChartColumn },
  masuk: { label: 'Masuk', path: '/login', icon: LogIn },
  lapor: { label: 'Lapor', path: '/lapor', icon: Megaphone },
  rute: { label: 'Rute', path: '/rute', icon: Route },
  laporanku: { label: 'Laporanku', path: '/laporanku', icon: FileText },
  lainnya: { label: 'Lainnya', path: '/lainnya', icon: Menu },
  aksi: { label: 'Aksi', path: '/aksi', icon: HandHeart },
  rekomendasi: { label: 'Rekomendasi', path: '/rekomendasi', icon: ListOrdered },
  hambatan: { label: 'Hambatan', path: '/hambatan', icon: Construction },
  moderasi: { label: 'Moderasi', path: '/moderasi', icon: ShieldCheck },
  bukti: { label: 'Bukti', path: '/bukti', icon: Images },
  rujukan: { label: 'Rujukan', path: '/rujukan', icon: Landmark },
  pengguna: { label: 'Pengguna', path: '/admin/pengguna', icon: Users },
  komunitas: { label: 'Komunitas', path: '/admin/komunitas', icon: UsersRound },
  logAi: { label: 'Log AI', path: '/admin/log-ai', icon: ScrollText },
} satisfies Record<string, TabDef>

export const TABS: Record<Persona, TabDef[]> = {
  tamu: [T.peta, T.dampak, T.masuk],
  warga: [T.peta, T.lapor, T.rute, T.laporanku, T.lainnya],
  relawan: [T.peta, T.aksi, T.rute, T.lapor, T.lainnya],
  koordinator: [T.rekomendasi, T.aksi, T.hambatan, T.lainnya],
  moderator: [T.moderasi, T.bukti, T.peta, T.lainnya],
  instansi: [T.rujukan, T.hambatan, T.lainnya],
  admin: [T.pengguna, T.komunitas, T.logAi, T.lainnya],
}

export const homeFor = (p: Persona) => TABS[p][0].path

/**
 * Tujuan setelah masuk — UI-SPEC S01 "Sukses": warga/relawan → laporan saya, koordinator → rekomendasi,
 * moderator → moderasi, instansi → rujukan, admin → admin.
 */
export const LOGIN_REDIRECT: Record<Persona, string> = {
  tamu: '/peta',
  warga: '/laporanku',
  relawan: '/laporanku',
  koordinator: '/rekomendasi',
  moderator: '/moderasi',
  instansi: '/rujukan',
  admin: '/admin/pengguna',
}
