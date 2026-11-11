/**
 * Simulasi keluaran AI untuk mockup — TIDAK memanggil AI sungguhan dan tanpa jaringan.
 * Keluaran disalin dari contoh di docs/AI-PROMPTS.md (§2.3 chat_extract, §4.3 action_plan, §6.1 faq).
 * Pemilihan contoh memakai kata kunci kamus fallback (§7.2/§7.3).
 */
import type { Category, Urgency } from './labels'

export interface ChatDraft {
  judul: string | null
  ringkasan: string | null
  kategori: Category | null
  lokasi_teks: string | null
  sejak: string | null
  urgensi_saran: Urgency | null
}
export interface ChatExtract {
  status: 'need_more' | 'draft_ready' | 'off_topic'
  draft: ChatDraft
  field_kurang: ('deskripsi' | 'kategori' | 'lokasi_teks' | 'sejak' | 'titik_peta' | 'foto')[]
  pertanyaan_lanjutan: string | null
  keyakinan: number
}

const DARURAT_WORDS = ['kebakaran', 'terbakar', 'orang terluka', 'pingsan', 'tersengat', 'kesetrum', 'tenggelam', 'kabel listrik putus', 'kabel putus']
const TOPIC_WORDS = ['sampah', 'numpuk', 'menumpuk', 'got', 'selokan', 'saluran', 'mampet', 'genangan', 'banjir', 'trotoar', 'jalan', 'lubang', 'lampu', 'taman', 'halte', 'pohon', 'ranting', 'lansia', 'bau', 'lalat']

/** AI-PROMPTS §2.3 Contoh 1 (kasus demo). */
const EXAMPLE_SAMPAH: ChatExtract = {
  status: 'draft_ready',
  draft: {
    judul: 'Sampah menumpuk di lahan kosong samping musala',
    ringkasan: 'Sampah menumpuk sekitar satu minggu di lahan kosong samping Musala Al-Ikhlas RT 03, berbau dan banyak lalat.',
    kategori: 'sampah',
    lokasi_teks: 'Lahan kosong samping Musala Al-Ikhlas, RT 03',
    sejak: '±1 minggu',
    urgensi_saran: 'sedang',
  },
  field_kurang: ['titik_peta', 'foto'],
  pertanyaan_lanjutan: 'Terima kasih. Boleh tandai titik lokasinya di peta dan tambahkan fotonya?',
  keyakinan: 0.86,
}
/** AI-PROMPTS §2.3 Contoh 2. */
const EXAMPLE_GOT: ChatExtract = {
  status: 'need_more',
  draft: { judul: null, ringkasan: 'Saluran air (got) tersumbat.', kategori: 'drainase', lokasi_teks: null, sejak: null, urgensi_saran: null },
  field_kurang: ['lokasi_teks', 'sejak', 'titik_peta', 'foto'],
  pertanyaan_lanjutan: 'Got yang mampet ada di dekat mana? Sebutkan patokan seperti nama jalan, gang, atau bangunan.',
  keyakinan: 0.55,
}
/** AI-PROMPTS §2.3 Contoh 3 (prompt injection diabaikan). */
const EXAMPLE_INJECTION: ChatExtract = {
  status: 'need_more',
  draft: { judul: 'Sampah di Jl. Tebet Raya', ringkasan: 'Ada sampah di Jl. Tebet Raya.', kategori: 'sampah', lokasi_teks: 'Jl. Tebet Raya', sejak: null, urgensi_saran: null },
  field_kurang: ['sejak', 'titik_peta', 'foto'],
  pertanyaan_lanjutan: 'Sampahnya sudah ada sejak kapan, dan kira-kira sebanyak apa?',
  keyakinan: 0.6,
}

export function simulateChat(text: string): ChatExtract {
  const t = text.toLowerCase()
  if (DARURAT_WORDS.some((w) => t.includes(w))) {
    // Aturan prompt #7: urgensi darurat + kalimat 112 (teks persis AI-PROMPTS §2.1)
    return {
      ...EXAMPLE_SAMPAH,
      status: 'need_more',
      draft: { ...EXAMPLE_SAMPAH.draft, judul: null, kategori: null, lokasi_teks: null, sejak: null, ringkasan: text.slice(0, 600), urgensi_saran: 'darurat' },
      field_kurang: ['kategori', 'lokasi_teks', 'sejak', 'titik_peta', 'foto'],
      pertanyaan_lanjutan: 'Ini terdengar darurat. Segera hubungi 112. Setelah aman, kamu bisa lanjutkan laporan di sini.',
      keyakinan: 0.7,
    }
  }
  if (t.includes('abaikan')) return EXAMPLE_INJECTION
  if (t.includes('got') || t.includes('mampet') || t.includes('selokan')) return EXAMPLE_GOT
  if (TOPIC_WORDS.some((w) => t.includes(w))) return EXAMPLE_SAMPAH
  return {
    status: 'off_topic',
    draft: { judul: null, ringkasan: null, kategori: null, lokasi_teks: null, sejak: null, urgensi_saran: null },
    field_kurang: [],
    // [ASUMSI] AI-PROMPTS hanya mengatur "jelaskan singkat apa yang bisa dilaporkan" tanpa teks final.
    pertanyaan_lanjutan: 'Aku hanya bisa membantu menyusun laporan masalah lingkungan atau layanan warga, misalnya sampah menumpuk, got mampet, atau lampu jalan mati.',
    keyakinan: 0.8,
  }
}

/** Label "Masih kurang: …" (UI-SPEC S03-A #4). */
export const MISSING_LABEL: Record<ChatExtract['field_kurang'][number], string> = {
  deskripsi: 'deskripsi',
  kategori: 'kategori',
  lokasi_teks: 'patokan lokasi',
  sejak: 'sejak',
  titik_peta: 'titik peta',
  foto: 'foto',
}

/** AI-PROMPTS §4.3 Contoh 1 — draf rencana aksi sampah, 8 relawan, ada TPS. */
export const ACTION_PLAN_DRAFT = {
  tugas: [
    { judul: 'Pengumpulan & pemilahan sampah', keahlian: 'pilah' as const, relawan: 4, butuh_rute: false },
    { judul: 'Angkut ke TPS terdekat', keahlian: 'angkut' as const, relawan: 2, butuh_rute: true },
    { judul: 'Dokumentasi before/after', keahlian: 'dokumentasi' as const, relawan: 1, butuh_rute: false },
  ],
  alat: ['sarung tangan', 'masker', 'karung', 'gerobak'],
  catatan_keselamatan: [
    'Gunakan sarung tangan dan masker; jangan memungut benda tajam dengan tangan kosong.',
    'Jika ditemukan limbah medis/kimia atau benda mencurigakan, hentikan dan laporkan ke moderator.',
  ],
  perkiraan_durasi_jam: 3,
}

export interface FaqAnswer {
  jawaban: string
  rujukan_faq: string[]
  niat_melapor: boolean
  di_luar_cakupan: boolean
}

/** AI-PROMPTS §6.1 tabel contoh FAQ. */
const FAQ_STATUS: FaqAnswer = {
  jawaban: 'Laporanmu masih berstatus Menunggu karena belum dicek moderator wilayah. Kamu bisa memantaunya di halaman Laporan Saya.',
  rujukan_faq: ['faq-status-menunggu'],
  niat_melapor: false,
  di_luar_cakupan: false,
}
const FAQ_LAPOR: FaqAnswer = {
  jawaban: 'Kamu bisa langsung melaporkannya. Tekan tombol Lapor lewat chat lalu ceritakan lokasinya.',
  rujukan_faq: ['faq-cara-lapor'],
  niat_melapor: true,
  di_luar_cakupan: false,
}
const FAQ_OUT: FaqAnswer = {
  jawaban: 'Maaf, aku belum punya jawabannya. Kamu bisa menghubungi admin lewat halaman Tentang AI.',
  rujukan_faq: [],
  niat_melapor: false,
  di_luar_cakupan: true,
}
/** [ASUMSI] tidak ada contoh untuk "Apa itu data sintetis?" — jawaban dari definisi PRD §8.7; isi faq.md [PERLU DATA]. */
const FAQ_SINTETIS: FaqAnswer = {
  jawaban: 'Data sintetis adalah data buatan untuk demo. Data ini selalu diberi label agar tidak dikira data nyata.',
  rujukan_faq: ['faq-data-sintetis'],
  niat_melapor: false,
  di_luar_cakupan: false,
}

export function simulateFaq(q: string): FaqAnswer {
  const t = q.toLowerCase()
  if (t.includes('belum diproses') || t.includes('menunggu')) return FAQ_STATUS
  if (t.includes('sintetis')) return FAQ_SINTETIS
  if (t.includes('cara melapor') || t.includes('lapor') || TOPIC_WORDS.some((w) => t.includes(w))) return FAQ_LAPOR
  return FAQ_OUT
}
