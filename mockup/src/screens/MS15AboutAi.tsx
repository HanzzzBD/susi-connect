/**
 * M-S15 Tentang AI — UI-SPEC S15 (teks statis, PM menulis final). Butir 6 & 8 masih berpenanda dari dokumen.
 * Butir 9 dinamis dari Z1 (di mockup: saklar mode cadangan/hotspot di panel dev). Varian galat → "Status tidak tersedia".
 */
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { Card } from '../components/ui/Card'

export default function MS15AboutAi() {
  const { screenState, isFallback, hotspot } = useMock()
  // [ASUMSI] pemetaan mode rute mockup: hotspot → Garis lurus, cadangan → Tersimpan, normal → Langsung
  const routeMode = hotspot ? 'Garis lurus' : isFallback ? 'Tersimpan' : 'Langsung'
  const aiMode = isFallback ? 'Mode AI: Cadangan (aturan & rekaman)' : 'Mode AI: Langsung (Gemini)'

  const items: { title?: string; body: React.ReactNode }[] = [
    { title: 'AI di SUSI Connect hanya memberi saran.', body: 'Moderator, koordinator, dan warga selalu memutuskan.' },
    { title: 'Di mana AI dipakai:', body: 'menyusun draf laporan dari chat, memberi label awal, menyusun draf rencana aksi, menyusun draf laporan ke instansi, menjawab pertanyaan seputar aplikasi.' },
    { title: 'Yang tidak memakai AI:', body: 'rekomendasi komunitas (skor rumus terbuka), penanda bahaya (aturan kata kunci yang selalu berlaku), status selesai (butuh bukti dan verifikasi manusia).' },
    { title: 'Data yang dikirim ke AI:', body: 'teks laporan/chat yang sudah disensor dari email dan nomor HP, kategori, nama kelurahan/kecamatan.' },
    { title: 'Tidak dikirim:', body: 'nama, email, nomor HP, koordinat persis, foto (kecuali fitur cek foto diaktifkan dan diberi tahu).' },
    { title: 'Penyedia:', body: 'Google Gemini (model kelas Flash). Kebijakan data penyedia: [PERLU DIVERIFIKASI — isi setelah tim membaca ketentuan tier yang dipakai].' },
    { title: 'Saat AI tidak tersedia:', body: 'aplikasi memakai aturan otomatis dan memberi label "Aturan otomatis".' },
    { title: 'Kalau AI salah:', body: 'moderator dapat mengoreksi; koreksi dicatat. Hubungi admin: [PERLU DATA email kontak tim].' },
    {
      title: 'Status saat ini',
      body:
        screenState === 'galat' ? (
          'Status tidak tersedia'
        ) : (
          <>
            {aiMode}; Mode rute: {routeMode}
          </>
        ),
    },
  ]

  return (
    <>
      <AppBar back title="Tentang AI" />
      <ScreenBody>
        <Card>
          <ol className="flex flex-col gap-3">
            {items.map((it, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai/15 text-xs font-bold text-ai">{i + 1}</span>
                <span>
                  {it.title && <strong>{it.title} </strong>}
                  {it.body}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </ScreenBody>
    </>
  )
}
