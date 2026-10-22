# UI-SPEC SUSI Connect — Spesifikasi Layar & Teks UI

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.2 · **Pemilik:** PM (teks & wireframe), FS (implementasi)
**Dirujuk dari:** [PRD.md](PRD.md) §9 · [SDD.md](SDD.md) §8.5 (route map) · Endpoint: [API.md](API.md)

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru. Mencakup semua route SDD §8.5 (S01–S18). Perbaikan dari SDD v1 §9: (1) route `/aksi` (daftar aksi saya), `/verifikasi-bukti`, `/rujukan` (daftar), `/notifikasi`, `/admin` ditambahkan karena endpoint-nya ada tetapi layarnya belum; (2) peta kerja memakai `MapMarker` (bukan `MapClusterLayer`) agar warna per status bisa ditampilkan. |
| 1.1 | 22 Okt 2026 | Tampilan & layout **smartroute-dashboard dipertahankan** (permintaan tim): tema gelap + font mono, navigasi `ViewToggle`, S02/S06/S08/S13 memakai satu `MapWorkspace` (peta layar penuh + panel mengambang + modal, dari `pages/Map.tsx`), S14 memakai layout `pages/Dashboard.tsx`; layar lain dibuat dengan gaya kartu yang sama. Ditambah route `/peta` dan `/dashboard`. Isi elemen, teks, validasi, dan endpoint tidak berubah. |
| 1.2 | 22 Okt 2026 | Hasil audit — endpoint yang belum punya layar diberi tombol: X4 "Ubah aksi" & T1 "Tambah tugas" (S11), R8 "Kembalikan ke jalur komunitas" (S12), R9 "Buka ulang" (S17 tab baru). Konfirmasi hambatan S01 untuk warga dipindah ke `/peta` (sebelumnya hanya di `/hambatan` yang tidak bisa dibuka warga). Segmen Koordinator menambah "Lapor". Sumber data kartu dashboard = K1 `breakdown`. |

---

## 0. Aturan bersama

**Bahasa visual (dari smartroute-dashboard, dipertahankan)** — latar gelap `dark-1`, kartu bergaris tipis `border-light-1/25 rounded-xl`, angka & label `font-mono`, judul `font-sans`, animasi masuk halus, panel yang bisa dilipat (ikon panah), marker peta berdenyut. Warna status: SDD §8.7.

**Dua kerangka halaman**

| Kerangka | Asal | Dipakai oleh | Susunan desktop | Susunan ponsel (< 768 px) |
| --- | --- | --- | --- | --- |
| `MapWorkspace` | `pages/Map.tsx` | S02 (`/`, `/peta`), S06, S08, S13 | Peta layar penuh; `ViewToggle` kanan atas; `QueuePanel` lipat di kanan atas (bawah ViewToggle); `ObstaclePanel` lipat di kiri atas; jam digital tengah atas (≥ 1024 px); detail di `ReportDetailModal` (modal tengah, latar buram) dengan dropdown tombol aksi; Keluar kanan bawah | Peta penuh; kedua panel menjadi satu *bottom sheet* bertab (40% tinggi); modal layar penuh; `ViewToggle` jadi bar bawah; jam disembunyikan |
| `DashboardPage` | `pages/Dashboard.tsx` | S14 (`/dampak`, `/dashboard`) | Header (judul + subjudul) bergaris bawah; baris 4 `KpiCard`; grid 4 kolom: `StatusSummaryCard` (1) · `ActionsStatusCard` (1) · `ReportRankingCard` (2) | Satu kolom; `ActionsStatusCard` di bawah, tidak disembunyikan |
| Halaman kartu | gaya kartu lama | S01, S03–S05, S07, S09–S12, S15–S17 | Kolom tengah maks 768 px (detail aksi: 2 kolom, peta di kanan) | Satu kolom |

**Navigasi (`AppShell` + `ViewToggle`)** — `ViewToggle` lama (segmen dengan sorotan beranimasi) menjadi navigasi utama per persona; lonceng notifikasi di sebelahnya; tombol "Logout" lama tetap di kanan bawah (desktop) dan pindah ke menu akun di ponsel. `FallbackBanner` bila `GET /health` melaporkan `ai_mode='fallback'` atau `routing_mode≠'live'`, atau `VITE_MAP_STYLE='offline'`:

> **Mode cadangan aktif.** Saran AI memakai aturan/rekaman, rute bisa berupa perkiraan garis lurus. Data tetap tersimpan.

**Segmen `ViewToggle` per persona**

| Persona | Segmen (kiri → kanan) |
| --- | --- |
| Tamu | Peta (`/`) · Dampak · Tentang AI · Masuk |
| Warga | Peta (`/peta`) · Lapor · Laporan Saya · Dampak |
| Relawan | Peta · Lapor · Aksi Saya · Laporan Saya |
| Koordinator | Rekomendasi · Aksi Saya · Hambatan · Lapor · Dampak |
| Moderator | Dashboard (`/dashboard`) · Moderasi · Bukti · Rujukan · Hambatan |
| Instansi | Rujukan · Hambatan · Dampak |
| Admin | Dashboard · Moderasi · Admin |

**State standar** (dipakai semua layar bila tidak disebut lain)

| State | Tampilan | Teks |
| --- | --- | --- |
| Memuat | Skeleton sesuai bentuk konten (kartu/peta abu-abu), bukan spinner layar penuh | (tanpa teks; `aria-busy="true"`) |
| Error jaringan (`NETWORK`) | `ErrorState` + tombol "Coba lagi" | "Tidak bisa terhubung ke server. Pastikan backend berjalan." |
| Error lain | `ErrorState` | `error.message` dari API |
| 401 | Redirect `/login?next=` + toast | "Sesi berakhir, silakan masuk lagi." |
| 403 | Halaman ringkas | "Halaman ini hanya untuk <peran>." + tombol "Kembali ke beranda" |
| 404 | `NotFoundPage` | "Halaman atau data tidak ditemukan." |
| Sukses aksi | Toast hijau 4 dtk, `role="status"` | per layar |
| Validasi | Pesan merah di bawah field, `aria-describedby`; fokus pindah ke field pertama yang salah | per field |

**Lencana AI** — `AiBadge`: "Saran AI" (sumber `gemini`), "Saran AI (tersimpan)" (`cache`), "Aturan otomatis" (`aturan`). `AiReason`: tombol "Kenapa?" → popover berisi alasan, "Tingkat keyakinan: rendah/sedang/tinggi", dan tautan "Pelajari cara kerja AI" → `/tentang-ai`.

**Label status** (sumber tunggal `lib/labels.ts`, lihat kamus PRD §8)

| Status laporan | Label | Ikon |
| --- | --- | --- |
| `menunggu` | Menunggu verifikasi | jam |
| `diverifikasi` | Diverifikasi | centang |
| `dikoordinasikan` | Dikoordinasikan komunitas | tangan |
| `diteruskan_instansi` | Diteruskan ke instansi | gedung |
| `selesai` | Selesai | centang ganda |
| `ditolak` | Ditolak | silang |

**Format** — tanggal: "7 Nov 2026, 09.12"; jarak: "1,8 km" / "650 m"; durasi: "± 7 menit"; angka desimal memakai koma. Semua angka rute/durasi/biaya diberi kata "perkiraan".

**Foto** — semua `<img>` foto laporan & bukti memuat URL Z2 (`/files/report-photos/:id`, `/files/evidences/:id`) lewat `fileUrl()` (SDD §8.2); bila 401/404 tampil kotak abu-abu "Foto tidak tersedia".

**Aksesibilitas** — semua kontrol bisa keyboard (urutan tab mengikuti urutan elemen di tabel); target sentuh ≥ 44 px; status tidak hanya warna (ikon + teks); gambar punya `alt` ("Foto laporan sampah, Tebet Barat"); kontras ≥ 4,5:1; `prefers-reduced-motion` mematikan animasi `motion`.

---

## S01 — Masuk (`/login`)

**Tujuan:** masuk dengan akun atau akun demo. **Peran:** publik. **Fitur:** M01.

| # | Elemen | Teks / placeholder | Validasi |
| --- | --- | --- | --- |
| 1 | Judul | "Masuk ke SUSI Connect" | — |
| 2 | Subjudul | "Laporkan masalah sekitar, temukan penangan, dan pantau sampai selesai." | — |
| 3 | Field email | Label "Email", placeholder "nama@email.com" | wajib; format email; maks 150 → "Format email tidak valid" |
| 4 | Field kata sandi | Label "Kata sandi", tombol mata "Tampilkan" | wajib; 8–72 karakter → "Kata sandi minimal 8 karakter" |
| 5 | Tombol utama | "Masuk" (memuat: "Memproses…") | nonaktif saat memuat |
| 6 | Kotak akun demo (hanya `VITE_DEMO_MODE=true`) | Judul "Akun demo (data sintetis)"; satu tombol per akun dari A3, mis. "Warga — Rina" | — |
| 7 | Tautan | "Lihat peta tanpa masuk" → `/` | — |

| State | Tampilan |
| --- | --- |
| Gagal login | Pesan di atas form: "Email atau kata sandi salah." |
| 429 | "Terlalu banyak percobaan. Coba lagi dalam 15 menit." |
| Demo nonaktif | Kotak #6 tidak dirender |
| Sukses | Redirect ke `next` atau beranda persona: warga/relawan → `/laporan-saya`, koordinator → `/komunitas/:id/rekomendasi`, moderator → `/moderasi`, instansi → `/rujukan`, admin → `/admin` |

**Endpoint:** mount → A3 (bila demo); submit → A1; tombol demo → A2; lalu `login(token, user)`.

---

## S02 — Beranda / peta publik (`/`)

**Tujuan:** menunjukkan laporan di sekitar (lokasi dibulatkan) dan ringkasan dampak. **Peran:** semua. **Fitur:** M11, M13. **Kerangka:** `MapWorkspace mode=publik` (tamu) / `mode=warga` di `/peta` (login: marker laporan sendiri ditandai "Laporanmu"). Elemen #1–#4 berada di `QueuePanel` berjudul "Ringkasan"; filter #7 di atas panel.

| # | Elemen | Teks | Catatan |
| --- | --- | --- | --- |
| 1 | Hero ringkas | "Masalah sekitar, diselesaikan bersama." | 1 baris di ponsel |
| 2 | Tombol utama | "Laporkan masalah" → `/lapor` (tamu → `/login?next=/lapor`) | — |
| 3 | Kartu dampak ringkas (4) | label dari K1 publik: "Laporan masuk", "Tingkat penyelesaian", "Jam relawan", "Perkiraan sampah terangkut" | tooltip = `formula` |
| 4 | `SyntheticBanner` | "Angka ini berasal dari data sintetis untuk demo, bukan dampak nyata." | bila `is_synthetic_share > 0` |
| 5 | Peta | `MapClusterLayer` dari R3; popup: label kategori, status, kelurahan, tanggal | lokasi ±110 m |
| 6 | Catatan privasi di bawah peta | "Lokasi di peta publik dibulatkan sekitar 100 meter untuk melindungi pelapor." | — |
| 7 | Filter status (chip) | "Semua", "Menunggu", "Dalam penanganan", "Selesai" | "Dalam penanganan" = `?status=diverifikasi,dikoordinasikan,diteruskan_instansi` |

| State | Teks |
| --- | --- |
| Kosong | "Belum ada laporan di area ini. Jadilah yang pertama melapor." |
| Peta offline tanpa basemap | Peta polos + titik; label kecil "Peta dasar offline" |

**Endpoint:** mount → R3 (bbox viewport, debounce 500 ms saat geser), K1 (tanpa token).

---

## S03 — Lapor (`/lapor`)

**Tujuan:** membuat laporan lewat chat atau formulir. **Peran:** login. **Fitur:** M02, M03, S05.

Dua tab: **"Ceritakan (chat)"** (default) dan **"Isi formulir"**. Draf dari chat bisa dipindah ke formulir.

### S03-A Tab chat (`ChatReporter`)

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Pesan sistem pembuka | "Ceritakan masalah yang kamu lihat. Sebutkan di mana dan sejak kapan, ya." |
| 2 | Input pesan | placeholder "Contoh: Di lahan kosong samping musala sampah numpuk seminggu…"; tombol "Kirim" | 
| 3 | Gelembung balasan AI | teks `reply` + `AiBadge` |
| 4 | `DraftCard` (muncul setelah balasan pertama) | judul "Draf laporan", lencana "Disusun oleh AI — periksa sebelum kirim"; field: Judul, Ringkasan, Kategori, Patokan lokasi, Sejak, Urgensi (saran) — semua bisa diedit; daftar "Masih kurang: titik peta, foto" |
| 5 | `PointPicker` | label "Tandai titik lokasi di peta"; tombol "Pakai lokasi saya" |
| 6 | Dropdown wilayah | "Kecamatan", "Kelurahan" (dari Z3; terisi otomatis dari titik bila `areas` punya `center` terdekat < 2 km, tetap bisa diubah) |
| 7 | `PhotoPicker` | "Tambah foto (maks 3)"; S05: tombol "Samarkan wajah/plat" per foto |
| 8 | Tombol utama | "Kirim laporan" (aktif bila ringkasan ≥ 20 karakter, kategori, titik, kelurahan terisi) |
| 9 | Tautan | "Pindah ke formulir" (membawa isi draf) |

| State | Tampilan / teks |
| --- | --- |
| AI berpikir | Gelembung "…" + `aria-live="polite"` "Sedang menyusun draf" |
| `status=off_topic` | balasan AI apa adanya; draf tidak ditampilkan |
| `urgensi_saran=darurat` | Kotak merah: "Ini terdengar darurat. Segera hubungi 112. Setelah aman, kamu bisa lanjutkan laporan di sini." |
| `redirect_to_form=true` | Toast: "Asisten sedang tidak tersedia. Kami pindahkan ceritamu ke formulir." → tab formulir terisi |
| Mode cadangan | `AiBadge` "Aturan otomatis"; pertanyaan lanjutan berupa daftar tetap |
| 429 | "Kamu mengirim terlalu cepat. Tunggu sebentar, ya." |
| Sukses | Redirect `/laporan/:id`; toast "Laporan terkirim. Kami sedang menyiapkan label awal." |

**Endpoint:** mount → C1; kirim → C2; konfirmasi → C3 (multipart).

### S03-B Tab formulir (`ReportForm`)

| # | Field | Label / placeholder | Validasi | Pesan error |
| --- | --- | --- | --- | --- |
| 1 | Kategori | "Kategori masalah" (radio kartu ikon, dari Z4) | wajib | "Pilih kategori" |
| 2 | Deskripsi | "Ceritakan masalahnya"; placeholder "Apa yang terjadi, sejak kapan, dan dampaknya bagi warga" | wajib, 20–2000 | "Deskripsi minimal 20 karakter" |
| 3 | Judul | "Judul singkat (opsional)" | 5–200 bila diisi | "Judul minimal 5 karakter" |
| 4 | Titik peta | "Lokasi masalah" + tombol "Pakai lokasi saya" | wajib, dalam DKI | "Tandai lokasi di peta" / "Lokasi di luar wilayah pilot DKI Jakarta" |
| 5 | Kecamatan, Kelurahan | dropdown | wajib, harus ada di Z3 | "Pilih kelurahan" |
| 6 | Patokan | "Patokan (opsional)"; placeholder "Contoh: samping Musala Al-Ikhlas RT 03" | 3–300 bila diisi | — |
| 7 | Foto | "Foto (opsional, maks 3, JPG/PNG/WebP ≤ 5 MB)" | tipe & ukuran dicek di browser | "Ukuran foto maksimal 5 MB" / "Format foto harus JPG, PNG, atau WebP" |
| 8 | Info privasi | "Data lokasi (EXIF) di foto akan dihapus otomatis. Jangan unggah foto wajah orang lain." | — | — |
| 9 | Tombol | "Kirim laporan" | — | — |

Foto dikompres di browser (sisi panjang ≤ 1280 px) sebelum diunggah. **Endpoint:** mount → Z4, Z3; kirim → R1.

---

## S04 — Laporan saya (`/laporan-saya`)

**Tujuan:** memantau laporan sendiri. **Peran:** login. **Fitur:** M02, M13.

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Judul | "Laporan Saya" |
| 2 | Filter status (chip) | "Semua", "Menunggu", "Diproses", "Selesai", "Ditolak" |
| 3 | Daftar `ReportCard` | judul, kategori, `StatusBadge`, kelurahan, tanggal, thumbnail; lencana kuning "Perlu konfirmasi bukti" bila ada bukti `after` menunggu (E4) |
| 4 | Tombol | "Laporan baru" |

| State | Teks |
| --- | --- |
| Kosong | "Kamu belum pernah melapor." + tombol "Laporkan masalah" |

**Endpoint:** mount → R2 `mine=true`, E4.

---

## S05 — Detail laporan (`/laporan/:id`)

**Tujuan:** status, label AI, riwayat, dan konfirmasi bukti. **Peran:** pelapor, moderator(W), koordinator(K)/anggota(K) terkait, admin. **Fitur:** M02, M05 (tampilan), M07, M10, M13.

| # | Elemen | Teks / isi |
| --- | --- | --- |
| 1 | Header | judul, `StatusBadge`, `UrgencyBadge`, lencana "Data sintetis" bila `is_synthetic` |
| 2 | `HazardBanner` (bila ada) | "Laporan ini mengandung indikasi bahaya (<label>). Jangan ditangani relawan tanpa petugas." |
| 3 | Panel triase | "Label awal" + `AiBadge` + `AiReason`; baris: Kategori, Urgensi, Penanganan, Keahlian; bila dikoreksi: "Diubah moderator: urgensi sedang → tinggi" |
| 4 | Triase belum selesai | "Sedang menyiapkan label awal…" (polling) |
| 5 | Deskripsi & foto | galeri, `alt` dari kategori |
| 6 | Peta kecil | marker lokasi persis (peran berhak) |
| 7 | `StatusTimeline` | tiap baris: label status, "oleh <peran>", waktu, alasan |
| 8 | Kartu aksi (bila ada) | "Ditangani oleh <komunitas>" + status aksi + tautan "Lihat aksi" |
| 9 | Kartu rujukan (bila ada) | "Rujukan instansi: <status>" + tautan "Lihat draf" |
| 10 | `BeforeAfter` (pelapor, bila bukti `after` menunggu) | judul "Apakah masalahnya sudah selesai?"; tombol "Ya, sudah selesai" (`sah`) dan "Belum, ada yang kurang" (buka field alasan, wajib 5–300) |
| 11 | Alasan ditolak (bila ditolak) | "Laporan ditolak: <label alasan>. <catatan>" |

| State | Teks |
| --- | --- |
| Sukses konfirmasi | "Terima kasih. Laporanmu ditandai selesai." / "Masukanmu dikirim ke koordinator." |
| `SELF_VERIFICATION` | "Bukti ini kamu unggah sendiri, jadi perlu diperiksa orang lain." |
| Laporan selesai | Banner hijau "Masalah ini sudah selesai dan buktinya diverifikasi." |

**Endpoint:** mount → R4 (`pollUntilTriaged`); konfirmasi → E3; setelah sukses → `refetch()`.

---

## S06 — Moderasi (`/moderasi`)

**Tujuan:** memverifikasi, meneruskan, atau menolak laporan. **Peran:** moderator. **Fitur:** M05, M06 (hasil), M07, S03, S04.

**Kerangka:** `MapWorkspace mode=moderasi`. Antrian (#2–#3) di `QueuePanel` (judul "Antrian Moderasi", urut "Terlama"/"Terbaru" memakai tombol sort lama); laporan juga tampil sebagai marker. Klik kartu atau "Lihat Lengkap →" di popup membuka `ReportDetailModal` berisi #4–#7 dan dropdown tombol #8–#10 (pola dropdown "Tandai" lama). Hasil #11 tampil di modal yang sama.

| # | Elemen | Teks / isi |
| --- | --- | --- |
| 1 | Judul | "Moderasi — Kecamatan <scope>" |
| 2 | Tab | "Menunggu (<n>)", "Diverifikasi", "Diteruskan", "Ditolak" |
| 3 | Kartu antrian | judul, kategori, urgensi, `AiBadge`, lencana "Kemungkinan duplikat (<n>)", waktu "2 jam lalu" |
| 4 | Panel detail | ringkasan S05 #1–#6 |
| 5 | `TriagePanel` (bisa diedit) | dropdown Kategori, Urgensi, Penanganan; multi-pilih Penanda bahaya, Keahlian; angka Perkiraan relawan (1–100); teks "Perubahanmu dicatat sebagai koreksi atas saran AI." |
| 6 | Kandidat duplikat (S03) | daftar "#39 · 42 m · Menunggu" + tombol "Tandai duplikat dari #39" |
| 7 | Cek foto (S04, bila aktif) | "Saran AI: foto sesuai kategori" / "ragu" / "tidak sesuai"; "Ada wajah/plat terlihat" |
| 8 | Tombol "Verifikasi" | aktif bila penanganan ≠ instansi dan tanpa penanda bahaya |
| 9 | Tombol "Teruskan ke instansi" | membuka dialog: pilih kanal (H1) + catatan opsional |
| 10 | Tombol "Tolak" | dialog: alasan (radio: Palsu / Duplikat / Di luar cakupan / Data kurang / Lainnya) + catatan wajib 5–300 |
| 11 | Hasil verifikasi | daftar 3 rekomendasi + skor; bila kosong: "Tidak ada komunitas yang cocok. Pertimbangkan meneruskan ke instansi." |

| State | Teks |
| --- | --- |
| Antrian kosong | "Tidak ada laporan yang menunggu. Kerja bagus!" |
| Triase pending | Tombol 8–10 nonaktif; "Menunggu label awal…" |
| `HANDLING_MISMATCH` | "Laporan ini perlu ditangani instansi. Gunakan Teruskan ke instansi." |
| `REPORT_INVALID_TRANSITION` | "Laporan ini sudah diproses moderator lain." + `refetch` |
| Sukses | "Laporan diverifikasi. 3 komunitas diberi tahu." / "Laporan diteruskan. Draf siap disalin." / "Laporan ditolak." |

**Endpoint:** mount → R2 `status=…`; pilih kartu → R4, R10; buka dialog teruskan → H1; tombol → R5 / R6 / R7.

---

## S07 — Verifikasi bukti (`/verifikasi-bukti`)

**Tujuan:** memeriksa bukti before/after. **Peran:** moderator. **Fitur:** M10.

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Judul | "Verifikasi Bukti" |
| 2 | Kartu per bukti | judul laporan, komunitas, `BeforeAfter` berdampingan, catatan, "Diunggah oleh anggota komunitas" |
| 3 | Tombol | "Sah — masalah selesai" / "Tolak bukti" (alasan wajib 5–300; placeholder "Contoh: foto after tidak menunjukkan lokasi yang sama") |

| State | Teks |
| --- | --- |
| Kosong | "Tidak ada bukti yang perlu diperiksa." |
| Sukses sah | "Bukti sah. Laporan #41 selesai." |
| `SELF_VERIFICATION` | "Kamu tidak bisa memverifikasi bukti yang kamu unggah sendiri." |

**Endpoint:** mount → E4; tombol → E3.

---

## S08 — Rekomendasi komunitas (`/komunitas/:id/rekomendasi`)

**Tujuan:** koordinator memilih laporan yang cocok. **Peran:** koordinator(K). **Fitur:** M06. **Kerangka:** `MapWorkspace mode=rekomendasi`: kartu match (#3) di `QueuePanel` (judul = #1, urut skor tertinggi/terendah), marker laporan di peta, `ScoreBreakdown` (#4) dan tombol (#5) di `ReportDetailModal`; tab #6 di atas daftar panel.

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Judul | "Rekomendasi untuk <nama komunitas>" (pemilih komunitas bila koordinator > 1) |
| 2 | Penjelasan | "Diurutkan dengan skor yang bisa dijelaskan: kategori, keahlian, wilayah, jarak, ketersediaan relawan." |
| 3 | Kartu match | judul laporan, kategori, urgensi, kelurahan, jarak "0,8 km", skor "0,96", tombol "Lihat rincian skor" |
| 4 | `ScoreBreakdown` | tabel: Komponen · Nilai · Bobot · Kontribusi (mis. "Kategori · 1,0 · 0,35 · 0,35") + kalimat `reasons` digabung " · " |
| 5 | Tombol | "Terima & buat aksi" / "Tolak" (alasan wajib 5–200; placeholder "Contoh: relawan kami sedang penuh minggu ini") |
| 6 | Tab | "Diusulkan", "Diterima", "Ditolak" |

| State | Teks |
| --- | --- |
| Kosong | "Belum ada laporan yang cocok untuk komunitasmu." |
| `REPORT_INVALID_TRANSITION` | "Laporan ini sudah diterima komunitas lain." |
| Sukses terima | redirect `/aksi/baru?report=:id`; toast "Laporan diterima. Susun rencana aksinya." |

**Endpoint:** mount → M1; rincian → R11; terima → M2; tolak → M3.

---

## S09 — Buat aksi (`/aksi/baru?report=:id`)

**Tujuan:** menyusun aksi + tugas dari draf AI. **Peran:** koordinator(K). **Fitur:** M08, M09 (titik), M13.

| # | Field / elemen | Label / teks | Validasi |
| --- | --- | --- | --- |
| 1 | Ringkasan laporan | judul, kategori, peta kecil | — |
| 2 | Kotak draf AI | "Draf rencana dari AI" + `AiBadge` + "Periksa dan ubah sesuai kondisi lapangan." ; tombol "Pakai draf" (mengisi #4–#9) | — |
| 3 | Judul aksi | "Judul aksi"; placeholder "Contoh: Bersih lahan musala" | wajib 5–200 |
| 4 | Jadwal | "Tanggal & jam mulai" | wajib, masa depan → "Jadwal harus di masa depan" |
| 5 | Titik kumpul | `PointPicker` "Titik kumpul" + "Nama titik kumpul" (placeholder "Pos RW 05") | wajib; nama 3–150 |
| 6 | Titik buang | `PointPicker` "Titik buang/serah (opsional)" + nama (placeholder "TPS Tebet Barat") | nama wajib bila titik dipilih |
| 7 | Kebutuhan relawan | "Jumlah relawan" (stepper) | 1–100 |
| 8 | Alat | chip input "Alat yang dibawa" | tiap 2–60, maks 20 |
| 9 | Catatan keselamatan | daftar teks, tombol "Tambah catatan" | **minimal 1**, tiap 5–300 → "Minimal 1 catatan keselamatan" |
| 10 | `TaskEditor` | per tugas: "Judul tugas", "Keahlian" (dropdown), "Kuota", centang "Butuh rute (angkut)", "Tugaskan ke" (multi-pilih anggota) | minimal 1 tugas; judul 3–200; kuota 1–50 |
| 11 | Tombol | "Buat aksi" | — |

| State | Teks |
| --- | --- |
| Draf memuat | "Menyusun draf rencana…" (maks 10 dtk) |
| Draf fallback | `AiBadge` "Aturan otomatis" + "Draf ini templat standar untuk kategori sampah." |
| `ALREADY_EXISTS` | "Laporan ini sudah punya aksi aktif." + tautan |
| Sukses | redirect `/aksi/:id`; toast "Aksi dibuat. Relawan bisa mulai mengambil tugas." |

**Endpoint:** mount → R4, G2 (anggota), R12 (`volunteers = est_volunteers`); ubah jumlah relawan lalu "Minta draf ulang" → R12; simpan → X1.

---

## S10 — Aksi saya (`/aksi`)

**Tujuan:** daftar aksi yang diikuti/dikoordinasi. **Peran:** relawan, koordinator. **Fitur:** M08.

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Judul | "Aksi Saya" |
| 2 | Tab | "Akan datang", "Berjalan", "Selesai" |
| 3 | Kartu | judul, komunitas, jadwal, kelurahan, "<n> tugas terbuka", lencana "Tugasmu" |
| 4 | Bagian "Aksi komunitasmu yang butuh relawan" | X2 `scope=community` dengan `open_tasks > 0` |
| 5 | Saklar ketersediaan | "Saya siap ikut aksi minggu ini" (A5 `is_available`) |

| State | Teks |
| --- | --- |
| Kosong | "Belum ada aksi. Cek bagian aksi komunitasmu yang butuh relawan." |

**Endpoint:** mount → X2 (`mine`, lalu `community` per komunitas), A4; saklar → A5.

---

## S11 — Detail aksi (`/aksi/:id`)

**Tujuan:** tugas, rute, bukti. **Peran:** anggota(K), koordinator(K), moderator(W), pelapor (baca). **Fitur:** M08, M09, M10, S02.

| # | Elemen | Teks / isi |
| --- | --- | --- |
| 1 | Header | judul, `StatusBadge` aksi, komunitas, jadwal |
| 2 | `SafetyNotes` | judul "Catatan keselamatan" (selalu terlihat, tidak bisa disembunyikan) |
| 3 | Info | titik kumpul, titik buang, alat |
| 4 | `TaskList` | per tugas: judul, keahlian, "<taken>/<quota> relawan", status; tombol sesuai hak: "Ambil tugas", "Lepas", "Saya sudah tiba" (check-in), "Tandai selesai"; koordinator: "Tugaskan" |
| 5 | `RoutePanel` | "Rute ke lokasi"; pilih asal: "Lokasi saya" / "Titik kumpul"; pilih tujuan: "Lokasi masalah" / "Lokasi → titik buang" (bila tugas `needs_route`); pilih moda (S02): "Jalan kaki", "Sepeda", "Motor/mobil"; hasil: "1,8 km · ± 7 menit (perkiraan)", lencana sumber ("Rute OpenRouteService" / "Rute tersimpan" / "Garis lurus"), "Menghindari 1 hambatan: Galian saluran"; peta dengan `MapRoute` + `ObstacleLayer` |
| 6 | S02 Perbandingan | tabel tiga moda: jarak, durasi, biaya ("—" bila belum dihitung) + catatan asumsi dari P2 |
| 7 | `EvidenceUploader` | "Foto sebelum" (opsi "Pakai foto laporan") dan "Foto sesudah"; catatan opsional |
| 8 | `BeforeAfter` | berdampingan + status verifikasi |
| 9 | Tombol koordinator | "Mulai aksi" (direncanakan), "Ajukan verifikasi" (berjalan; dialog jam per relawan + "Perkiraan sampah terangkut (kg)"), "Batalkan aksi" (alasan wajib) |
| 10 | Ubah aksi (koordinator, hanya `direncanakan`) | tombol "Ubah aksi" → form S09 terisi (judul, jadwal, titik, relawan, alat, catatan keselamatan); sukses: "Aksi diperbarui." |
| 11 | Tambah tugas (koordinator, `direncanakan`/`berjalan`) | tombol "+ Tambah tugas" di `TaskList` → dialog field `TaskEditor` satu baris |

| State | Teks |
| --- | --- |
| Rute garis lurus | Kotak kuning: "Rute garis lurus — layanan rute tidak tersedia. Jarak dihitung lurus, bukan jalan." |
| Lokasi saya ditolak browser | "Izin lokasi ditolak. Rute dihitung dari titik kumpul." |
| `TASK_QUOTA_FULL` | "Tugas ini sudah penuh." |
| `EVIDENCE_REQUIRED` | "Unggah minimal 1 foto sesudah sebelum mengajukan verifikasi." |
| Menunggu verifikasi | Banner "Bukti sedang diperiksa moderator atau pelapor." |
| Terverifikasi | Banner hijau "Aksi selesai dan terverifikasi. Terima kasih!" |

**Endpoint:** mount → X3, O1 (bbox aksi); tombol tugas → T2/T3/T4/T5/T6; rute → P1 (saat panel dibuka atau parameter berubah), S02 → P2; unggah → E1; koordinator → X4 (ubah), T1 (tambah tugas), X5/X6/X7. Setelah mutasi → `refetch()`.

---

## S12 — Rujukan instansi (`/rujukan`, `/rujukan/:id`)

**Tujuan:** menyalin draf ke kanal resmi dan mencatat tindak lanjut. **Peran:** moderator(W), instansi(W), pelapor. **Fitur:** M07.

**Daftar `/rujukan`:** tab "Draf", "Terkirim", "Ditindaklanjuti"; kartu: judul laporan, asal ("Diteruskan" / "Bersama aksi komunitas"), kanal, nomor tiket. Kosong: "Belum ada rujukan di wilayahmu."

**Detail `/rujukan/:id`**

| # | Elemen | Teks / validasi |
| --- | --- | --- |
| 1 | Peringatan tetap | "SUSI Connect tidak terhubung langsung ke instansi. Kirim lewat kanal resmi di bawah." |
| 2 | Kanal | nama, tautan "Buka <nama kanal>" (tab baru), catatan |
| 3 | Draf | textarea berisi `draft_text` + `AiBadge`; koordinat sudah terisi; 50–5000 karakter |
| 4 | Tombol | "Salin draf" → toast "Draf disalin." ; "Unduh foto lampiran" |
| 5 | Field | "Nomor tiket dari kanal resmi (opsional)" 1–100 |
| 6 | Tombol status | "Tandai sudah dikirim" (draf → terkirim); "Tandai ditindaklanjuti" (moderator/instansi) |
| 7 | Bukti tindak lanjut | `EvidenceUploader` "Foto setelah ditangani instansi" |
| 8 | Tombol | "Tandai laporan selesai" (hanya origin `instansi`, aktif bila ada bukti `after` sah) |
| 9 | Untuk origin `campuran` | info: "Laporan ini juga ditangani komunitas. Status laporan mengikuti aksi komunitas." |
| 10 | Tombol moderator (origin `instansi`, belum `ditindaklanjuti`) | "Kembalikan ke jalur komunitas" → dialog alasan wajib 5–300 (placeholder "Contoh: kelurahan meminta warga bergotong royong"); nonaktif bila ada penanda bahaya, tooltip "Laporan berpenanda bahaya harus ditangani instansi"; sukses: "Laporan dikembalikan dan direkomendasikan ke komunitas." |

| State | Teks |
| --- | --- |
| `EVIDENCE_REQUIRED` | "Perlu foto setelah ditangani yang sudah diverifikasi." |
| Sukses | "Status rujukan diperbarui." / "Laporan ditandai selesai." |

**Endpoint:** daftar → F1; detail → F2; simpan → F3; bukti → E2; selesai → F4; kembalikan → R8.

---

## S13 — Hambatan jalan (`/hambatan`)

**Tujuan:** menandai/mencabut hambatan. **Peran:** koordinator, moderator, instansi (Must); semua login untuk konfirmasi (S01). **Fitur:** M09, S01. **Kerangka:** `MapWorkspace mode=hambatan`: daftar #2 di `ObstaclePanel` (terbuka otomatis; tab "Aktif" / "Menunggu konfirmasi" menggantikan "Bermasalah" / "Optimal" lama, tombol "+ Tandai hambatan"); klik peta membuka form #3 di modal.

| # | Elemen | Teks / validasi |
| --- | --- | --- |
| 1 | Peta | `ObstacleLayer` + klik untuk memilih titik |
| 2 | Daftar | jenis, keterangan, "Berlaku sampai 14 Nov, 23.59", lencana "Kedaluwarsa" (abu-abu) / "Menunggu konfirmasi" |
| 3 | Form "Tandai hambatan" | "Jenis hambatan" (dropdown, wajib); titik (wajib, dalam DKI); "Radius" slider 10–500 m (default 50); "Keterangan (opsional)" ≤ 300; "Berlaku sampai" (default per jenis, maks 30 hari → "Maksimal 30 hari") |
| 4 | Tombol | "Simpan hambatan" ; per item "Cabut" (pembuat/moderator) |
| 5 | S01 konfirmasi | "Masih ada?" → "Ya, masih" / "Sudah tidak ada". Karena `/hambatan` hanya untuk koordinator/moderator/instansi, warga & relawan memakai `ObstaclePanel` yang sama di `/peta` (`mode=warga`): tab "Menunggu konfirmasi" + tombol ini + "+ Usulkan hambatan" (O2 → `menunggu_konfirmasi`) |
| 6 | Catatan | "Hambatan memengaruhi rute relawan. Hambatan kedaluwarsa otomatis tidak dipakai." |

| State | Teks |
| --- | --- |
| Kosong | "Tidak ada hambatan aktif di area ini." |
| Sukses | "Hambatan disimpan. Rute yang melewati area ini akan dihitung ulang." |

**Endpoint:** mount → O1; simpan → O2; cabut → O4; konfirmasi → O3.

---

## S14 — Dampak (`/dampak`)

**Tujuan:** metrik dengan rumus. **Peran:** semua (detail sesuai peran). **Fitur:** M11. **Kerangka:** `DashboardPage` — judul "Dampak" (atau "Dashboard — Kecamatan <scope>" di `/dashboard`); 4 `KpiCard` teratas = Laporan masuk, Tingkat penyelesaian, Jam relawan, Perkiraan sampah terangkut; `StatusSummaryCard` = `breakdown.reports_by_status` dari K1; `ActionsStatusCard` = `breakdown.actions_by_status` + `open_tasks`; `ReportRankingCard` = laporan prioritas (urgensi lalu umur, R2) dengan filter kelurahan (pengganti filter koridor) — **hanya saat login**; untuk tamu kolomnya diisi `MetricsGrid` ringkas. Metrik lain (#4) di bawah grid dalam `MetricsGrid`. Data: K1 + R2 (login) / K1 (publik).

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Judul | "Dampak" |
| 2 | `SyntheticBanner` | sama dengan S02 |
| 3 | Filter (login) | "Kecamatan" (moderator/instansi terkunci), "Dari", "Sampai", "Komunitas" (koordinator), saklar "Sertakan data sintetis" |
| 4 | `MetricsGrid` | kartu per metrik: label, nilai, satuan, ikon "i" → tooltip `formula` |
| 5 | Bagian Green IT | "Panggilan AI & token per laporan" (dari metrik), kalimat "Kami mengukur biaya AI agar tetap hemat." |

| State | Teks |
| --- | --- |
| Nilai null | "—" + tooltip "Belum ada data untuk dihitung." |
| Kosong | "Belum ada data pada filter ini." |

**Endpoint:** mount & ubah filter (debounce 400 ms) → K1.

---

## S15 — Tentang AI (`/tentang-ai`)

**Tujuan:** transparansi AI. **Peran:** publik. **Fitur:** M13. Teks statis (PM menulis final):

1. **"AI di SUSI Connect hanya memberi saran."** Moderator, koordinator, dan warga selalu memutuskan.
2. **Di mana AI dipakai:** menyusun draf laporan dari chat, memberi label awal, menyusun draf rencana aksi, menyusun draf laporan ke instansi, menjawab pertanyaan seputar aplikasi.
3. **Yang tidak memakai AI:** rekomendasi komunitas (skor rumus terbuka), penanda bahaya (aturan kata kunci yang selalu berlaku), status selesai (butuh bukti dan verifikasi manusia).
4. **Data yang dikirim ke AI:** teks laporan/chat yang sudah disensor dari email dan nomor HP, kategori, nama kelurahan/kecamatan.
5. **Tidak dikirim:** nama, email, nomor HP, koordinat persis, foto (kecuali fitur cek foto diaktifkan dan diberi tahu).
6. **Penyedia:** Google Gemini (model kelas Flash). Kebijakan data penyedia: [PERLU DIVERIFIKASI — isi setelah tim membaca ketentuan tier yang dipakai].
7. **Saat AI tidak tersedia:** aplikasi memakai aturan otomatis dan memberi label "Aturan otomatis".
8. **Kalau AI salah:** moderator dapat mengoreksi; koreksi dicatat. Hubungi admin: [PERLU DATA email kontak tim].
9. **Status saat ini** (dinamis): "Mode AI: Langsung (Gemini)" / "Mode AI: Cadangan (aturan & rekaman)"; "Mode rute: Langsung / Tersimpan / Garis lurus".

**Endpoint:** mount → Z1 (untuk butir 9). State error Z1: butir 9 menampilkan "Status tidak tersedia".

---

## S16 — Notifikasi (`/notifikasi`)

**Tujuan:** daftar pemberitahuan. **Peran:** login. **Fitur:** S06.

Elemen: judul "Notifikasi"; tombol "Tandai semua dibaca"; daftar (judul, isi, waktu, titik biru bila belum dibaca; klik → `link`). Kosong: "Belum ada notifikasi." **Endpoint:** mount → N1; klik → N2; tombol → N3. Lonceng di header memanggil N1 `unread=true&limit=1` tiap 60 dtk.

---

## S17 — Admin (`/admin`)

**Tujuan:** mengelola pengguna, komunitas, kanal instansi, melihat log AI. **Peran:** admin. **Fitur:** M01, M13.

| Tab | Elemen | Validasi | Endpoint |
| --- | --- | --- | --- |
| Pengguna | tabel (nama, email, peran, kecamatan); form "Tambah pengguna": Nama, Email, Kata sandi, Peran, Kecamatan (wajib untuk moderator/instansi) | API U2 | U1, U2, U3 |
| Komunitas | tabel; form: Nama, Deskripsi, Kategori (multi), Keahlian (multi), Kecamatan, Kelurahan layanan (multi), Markas (titik), Kontak, Koordinator (email) | API G3 | G1, G3, G4, G5, G6 |
| Kanal instansi | tabel; form: Nama, URL (https), Kategori, Kecamatan (kosong = nasional), Catatan | API H2 | H1, H2, H3 |
| Log AI | tabel: waktu, tujuan, sumber, status, token, latensi, "dikoreksi" | — | U4 |
| Laporan ditolak | tabel laporan `ditolak` (judul, alasan, tanggal) + tombol "Buka ulang" → dialog alasan banding wajib 5–300; sukses: "Laporan kembali ke antrian moderasi." | catatan 5–300 | R2 `status=ditolak`, R9 |

Teks kosong: "Belum ada data." Sukses: "Tersimpan."

---

## S18 — Widget chatbot (semua halaman)

**Tujuan:** tanya-jawab seputar aplikasi dan pintu ke lapor via chat. **Peran:** semua. **Fitur:** M12.

| # | Elemen | Teks |
| --- | --- | --- |
| 1 | Tombol mengambang | ikon chat, `aria-label="Buka bantuan"` (disembunyikan di `/lapor`) |
| 2 | Panel | judul "Bantuan SUSI"; subjudul "Tanya seputar cara memakai aplikasi." |
| 3 | Saran cepat | "Bagaimana cara melapor?", "Kenapa laporanku belum diproses?", "Apa itu data sintetis?" |
| 4 | Input | placeholder "Tulis pertanyaanmu…"; 3–500 karakter |
| 5 | Jawaban | teks + `AiBadge` + "Sumber: <judul bagian FAQ>" |
| 6 | Bila `niat_melapor` | tombol "Lapor lewat chat" → `/lapor` |
| 7 | Bila `di_luar_cakupan` | jawaban penolakan apa adanya |

| State | Teks |
| --- | --- |
| Mode cadangan | `AiBadge` "Aturan otomatis"; jawaban = kutipan bagian FAQ |
| 429 | "Kamu bertanya terlalu cepat. Tunggu sebentar, ya." |

**Endpoint:** kirim → C4 dengan `history` ≤ 6 giliran (disimpan di state komponen saja).
