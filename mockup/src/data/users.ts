/** PRD §12.2 — pengguna demo (semua sintetis, akhiran "(demo)"). Kata sandi tidak disimpan di mockup. */
import type { Persona } from '../lib/labels'
import type { User } from './types'

const base = { isSynthetic: true as const }

export const USERS: User[] = [
  { ...base, id: 1, name: 'Rina (demo)', email: 'rina.warga@demo.susi.id', role: 'warga', persona: 'warga', isAvailable: false, isDemo: true },
  { ...base, id: 2, name: 'Joko (demo)', email: 'joko.warga@demo.susi.id', role: 'warga', persona: 'warga', isAvailable: false, isDemo: true },
  { ...base, id: 3, name: 'Dimas (demo)', email: 'dimas.relawan@demo.susi.id', role: 'warga', persona: 'relawan', communityId: 1, memberRole: 'anggota', isAvailable: true, isDemo: true },
  { ...base, id: 4, name: 'Sari (demo)', email: 'sari.koordinator@demo.susi.id', role: 'warga', persona: 'koordinator', communityId: 1, memberRole: 'koordinator', isAvailable: true, isDemo: true },
  { ...base, id: 5, name: 'Andi (demo)', email: 'andi.koordinator@demo.susi.id', role: 'warga', persona: 'koordinator', communityId: 2, memberRole: 'koordinator', isAvailable: true, isDemo: true },
  { ...base, id: 6, name: 'Tono (demo)', email: 'tono.koordinator@demo.susi.id', role: 'warga', persona: 'koordinator', communityId: 3, memberRole: 'koordinator', isAvailable: false, isDemo: true },
  { ...base, id: 7, name: 'Budi (demo)', email: 'budi.moderator@demo.susi.id', role: 'moderator', persona: 'moderator', scopeKecamatan: 'Tebet', isDemo: true },
  { ...base, id: 8, name: 'Maya (demo)', email: 'maya.moderator@demo.susi.id', role: 'moderator', persona: 'moderator', scopeKecamatan: 'Setiabudi', isDemo: true },
  { ...base, id: 9, name: 'Lina (demo)', email: 'lina.instansi@demo.susi.id', role: 'instansi', persona: 'instansi', scopeKecamatan: 'Tebet', isDemo: true },
  { ...base, id: 10, name: 'Admin (demo)', email: 'admin@demo.susi.id', role: 'admin', persona: 'admin', isDemo: true },
  // Anggota pelengkap Bank Sampah Melati (PRD §12.2, is_demo=false). Nama tampilan [ASUMSI].
  { ...base, id: 11, name: 'Relawan Melati 1', email: 'relawan.melati1@demo.susi.id', role: 'warga', persona: 'relawan', communityId: 1, memberRole: 'anggota', isAvailable: true, isDemo: false },
  { ...base, id: 12, name: 'Relawan Melati 2', email: 'relawan.melati2@demo.susi.id', role: 'warga', persona: 'relawan', communityId: 1, memberRole: 'anggota', isAvailable: true, isDemo: false },
  { ...base, id: 13, name: 'Relawan Melati 3', email: 'relawan.melati3@demo.susi.id', role: 'warga', persona: 'relawan', communityId: 1, memberRole: 'anggota', isAvailable: true, isDemo: false },
  { ...base, id: 14, name: 'Relawan Melati 4', email: 'relawan.melati4@demo.susi.id', role: 'warga', persona: 'relawan', communityId: 1, memberRole: 'anggota', isAvailable: true, isDemo: false },
]

/** Akun yang dipakai tiap persona di mockup (persona utama PRD §6). */
export const PERSONA_USER_ID: Record<Persona, number | null> = {
  tamu: null,
  warga: 1,
  relawan: 3,
  koordinator: 4,
  moderator: 7,
  instansi: 9,
  admin: 10,
}

/** Tombol akun demo M-S01 (UI-SPEC S01 #6, pola contoh "Warga — Rina"). */
export const DEMO_ACCOUNTS: { persona: Persona; label: string }[] = [
  { persona: 'warga', label: 'Warga — Rina' },
  { persona: 'relawan', label: 'Relawan — Dimas' },
  { persona: 'koordinator', label: 'Koordinator — Sari' },
  { persona: 'moderator', label: 'Moderator — Budi' },
  { persona: 'instansi', label: 'Instansi — Lina' },
  { persona: 'admin', label: 'Admin — Admin' },
]

export const userById = (id: number) => USERS.find((u) => u.id === id)
