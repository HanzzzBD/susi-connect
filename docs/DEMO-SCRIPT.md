# DEMO-SCRIPT SUSI Connect — Grand Final & Video

**Tanggal:** 22 Oktober 2026 · **Versi:** 2.1 · **Pemilik:** PM (naskah, presenter), FS (operator laptop), BE (cadangan teknis), DA (angka & slide)
**Dirujuk dari:** PRD §16 · Data: PRD §12 · Layar: UI-SPEC.md

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru, menurunkan PRD v1 §16 menjadi klik demi klik. Perubahan urutan: langkah rute (v1 3:30–4:20) dipindah setelah "buat aksi" karena rute membutuhkan `action_id` (API P1). Kasus duplikat & bahaya dipindah ke cadangan Q&A agar 7 menit cukup. |
| 1.1 | 22 Okt 2026 | Klik disesuaikan dengan layout smartroute-dashboard yang dipertahankan: moderasi, rekomendasi, dan hambatan dikerjakan di peta layar penuh (panel mengambang + modal), navigasi lewat segmen `ViewToggle`. |
| 1.2 | 22 Okt 2026 | Hasil audit: langkah 7 memakai akun moderator (metrik token AI & pelanggaran keselamatan tidak tersedia untuk tamu); tidak ada kartu "Laporan selesai" → pakai "Tingkat penyelesaian" + hitungan status; langkah 3 menambah koreksi perkiraan relawan/keahlian karena skor 0,96/0,75/0,66 bergantung pada keluaran triase. |
| 2.0 | 22 Okt 2026 | Demo memakai **aplikasi mobile di 3 HP Android** (warga, koordinator, relawan) + **web di laptop** (moderator, dashboard); jaringan Cloudflare Tunnel dengan cadangan hotspot; ditampilkan lewat scrcpy. |
| 2.1 | 22 Okt 2026 | Langkah 5 menambah opsi ≤ 20 dtk rute angkutan umum ke lokasi (M15) dan notifikasi push (M17); porsi moda dijaga kecil (PRD R19). |

---

## 0. Persiapan (H-1 dan 30 menit sebelum tampil)

| # | Cek | Perintah / tindakan | Lulus bila |
| --- | --- | --- | --- |
| 1 | Seed bersih | `cd backend && npm run seed` (H-1 malam, **sesudah** gladi rekam cache rute) | Ringkasan akun tercetak |
| 2 | Cache AI & rute | `npm run ai:record` dan gladi online penuh 1× (H-1) ; `npm run routes:export` | File baru di `seed/ai-cache/`, `seed/route-cache.json` |
| 3 | Mode | `.env` backend: `AI_MODE=live`, `ROUTING_MODE=live`; web: `VITE_MAP_STYLE=online`. **Saklar cadangan** disiapkan sebagai `backend/.env.offline` + `web/.env.offline` | `GET /api/health` sesuai |
| 4 | Perangkat | **HP-A** (Android) login **P1 Warga Rina**; **HP-B** login **P3 Koordinator Sari**; **HP-C** login **P4 Relawan Dimas**; **laptop** Chrome login **P2 Moderator Budi** (web) + tab dashboard. Layar HP ditampilkan ke proyektor dengan `scrcpy` via USB (satu jendela per HP) [PERLU DIVERIFIKASI beberapa instance sekaligus] | Tidak perlu login di depan juri |
| 4b | Jaringan | `cloudflared tunnel run susi` aktif; hotspot laptop menyala dan ketiga HP sudah pernah tersambung; di HP: Pengaturan server → "Uji koneksi" hijau | Banner jaringan tidak muncul (internet) |
| 5 | Layar | Zoom browser 110%, mode terang, notifikasi OS mati, baterai > 80%, charger | — |
| 6 | Laptop cadangan | Setup identik, seed sama, di meja | Bisa menjalankan langkah 1–9 |
| 7 | Video cadangan | `demo-backup.mp4` lokal di desktop | Bisa diputar tanpa internet |
| 8 | Foto demo | `~/Desktop/demo/sampah-before.jpg`, `sampah-after.jpg`, `trotoar.jpg` (foto buatan tim, tanpa wajah/plat) | — |
| 9 | Clipboard teks | File `demo-teks.txt` berisi semua teks yang diketik di bawah (salin-tempel bila gugup) | — |

**Jaringan HP:** bila internet venue putus, aplikasi otomatis pindah ke IP hotspot laptop (banner kuning "Terhubung lewat hotspot laptop"); bila tidak pindah dalam 10 dtk, buka Lainnya → Pengaturan server → pilih hotspot. **Aturan saklar cadangan (dipakai di langkah mana pun bila internet/API gagal):** FS menghentikan backend, `cp .env.offline .env`, `npm run dev` (≤ 20 dtk), muat ulang tab. Presenter berkata: *"Kami pindah ke mode cadangan — lihat lencananya, aplikasi jujur memberi tahu bahwa ini aturan otomatis dan rute tersimpan."* Ini justru menunjukkan kriteria offline.

**Teks yang diketik** (juga di `demo-teks.txt`):

- T1 (chat): `Di lahan kosong samping Musala Al-Ikhlas RT 03 sampah numpuk udah seminggu, bau banget dan banyak lalat`
- T2 (tolak match, cadangan): `Relawan kami sedang penuh minggu ini`
- T3 (catatan keselamatan tambahan): `Bawa air minum dan istirahat tiap 1 jam`
- T4 (hambatan): keterangan `Galian saluran`, radius 60 m, titik **[KOORDINAT_HAMBATAN — ditetapkan FS & PM di PRE-12 lalu final di PM-10 agar memotong rute Pos RW 05 → lokasi → TPS]**
- T5 (trotoar, form): `Trotoar di depan halte Jl. Prof. Dr. Soepomo berlubang besar sekitar 1 meter, sudah ada pejalan kaki yang terperosok.`

---

## 1. Naskah 7 menit (live)

Format: **Waktu · Profil · Klik/aksi → hasil yang harus terlihat · Kalimat presenter · Cadangan bila gagal.**

### Langkah 1 — Masalah (0:00–0:50) · Slide

- Slide 1: foto (buatan tim) tumpukan sampah + kutipan wawancara/survei. Angka hanya dari hasil validasi tim **[PERLU DATA]**; bila belum ada, tampilkan kutipan kualitatif saja.
- Slide 2: diagram "Laporan → ??? → Selesai": yang hilang adalah *siapa yang mengerjakan* dan *buktinya*.
- **Kalimat:** "Laporan sudah banyak; yang hilang adalah siapa yang mengerjakan dan bukti bahwa masalahnya benar selesai."
- **Cadangan:** proyektor gagal → ceritakan sambil membuka P1.

### Langkah 2 — Lapor lewat chat (0:50–1:50) · P1 Warga Rina

1. Klik menu **"Lapor"** → tab **"Ceritakan (chat)"** sudah aktif → pesan pembuka "Ceritakan masalah yang kamu lihat…" terlihat.
2. Tempel **T1** → **"Kirim"** → dalam ≤ 5 dtk muncul balasan "…Boleh tandai titik lokasinya di peta dan tambahkan fotonya?" + **DraftCard**: Kategori *Sampah*, Urgensi *Sedang*, Patokan *Lahan kosong samping Musala Al-Ikhlas, RT 03*, lencana **"Saran AI"**, "Masih kurang: titik peta, foto".
3. Di peta, klik titik demo (pin sudah ditandai di peta gladi: −6.23190, 106.85410) → dropdown terisi **Tebet / Tebet Barat**.
4. **"Tambah foto"** → `sampah-before.jpg`.
5. **"Kirim laporan"** → pindah ke detail laporan; toast "Laporan terkirim. Kami sedang menyiapkan label awal."; dalam ≤ 15 dtk panel **Label awal** terisi + tombol **"Kenapa?"**.
- **Kalimat:** "Warga cukup bercerita. Draf ini dibuat AI dan wajib dikonfirmasi warga. Foto otomatis dibuang data lokasinya."
- **Cadangan:** balasan AI > 10 dtk → otomatis "Aturan otomatis" (tetap lanjut, jelaskan lencananya). Laporan gagal terkirim → buka laporan seed **L01** dari "Laporan Saya".

### Langkah 3 — Moderasi + koreksi AI (1:50–2:30) · P2 Moderator Budi

1. Segmen **"Moderasi"** di `ViewToggle` → peta layar penuh; buka panel **"Antrian Moderasi"** (kanan atas) → kartu teratas (laporan baru Rina) → modal detail terbuka (atau klik marker → **"Lihat Lengkap →"**).
2. Klik **"Kenapa?"** → alasan AI terlihat.
3. Di **TriagePanel**, ubah **Urgensi: Sedang → Tinggi** → teks "Perubahanmu dicatat sebagai koreksi atas saran AI."
4. Bila panel menunjukkan *Perkiraan relawan* ≠ 8 atau keahlian ≠ angkut+pilah (keluaran Gemini bisa berbeda), set ke **8** dan **angkut, pilah** sebelum verifikasi agar skor sama dengan slide — sekaligus contoh koreksi manusia. Dropdown tombol di modal → **"Verifikasi"** → toast "Laporan diverifikasi. 3 komunitas diberi tahu." + daftar 3 rekomendasi dengan skor 0,96 / 0,75 / 0,66.
- **Kalimat:** "AI menyarankan, manusia memutuskan — dan koreksinya tercatat."
- **Cadangan:** tombol nonaktif karena triase pending > 15 dtk → tunggu atau buka **L02** (sudah diverifikasi).

### Langkah 4 — Matching + buat aksi (2:30–3:30) · P3 Koordinator Sari

1. Segmen **"Rekomendasi"** → panel kanan atas berisi kartu laporan Rina, skor **0,96** → klik → modal dengan **"Lihat rincian skor"** → tabel K 1,0×0,35 … dan kalimat "Fokus Sampah · Punya keahlian angkut & pilah · Satu kelurahan · 0,8 km · 6 dari 8 relawan tersedia".
2. **"Terima & buat aksi"** → halaman Buat aksi; kotak **"Draf rencana dari AI"** (≤ 10 dtk) → **"Pakai draf"** → tugas *Pengumpulan & pemilahan (4)*, *Angkut ke TPS terdekat (2, butuh rute)*, *Dokumentasi (1)*, 2 catatan keselamatan.
3. Tambah catatan keselamatan **T3**.
4. Judul sudah terisi "Bersih lahan musala"; jadwal = besok 07.00 (default form); titik kumpul **Pos RW 05** dan titik buang **TPS Tebet Barat** sudah terisi default dari seed komunitas (default diisi MB-13 dari markas komunitas & TPS seed).
5. **"Buat aksi"** → halaman aksi; toast "Aksi dibuat…".
- **Kalimat:** "Rekomendasi bukan kotak hitam: setiap angka bisa dijelaskan. AI hanya membuat draf; catatan keselamatan wajib."
- **Cadangan:** draf AI gagal → templat "Aturan otomatis", tetap lanjut. Pembuatan aksi gagal → buka aksi seed **A03** (laporan L03).

### Langkah 5 — Rute + hambatan (3:30–4:20) · P4 Relawan Dimas, lalu P3

1. P4: Segmen **"Aksi Saya"** → bagian "Aksi komunitasmu yang butuh relawan" → **"Bersih lahan musala"** → tugas *Angkut ke TPS terdekat* → **"Ambil tugas"** → "1/2 relawan", lencana "Tugasmu".
2. **RoutePanel**: asal **"Titik kumpul"**, tujuan **"Lokasi → titik buang"**, moda **"Motor/mobil"** → garis rute + "± x km · ± y menit (perkiraan)", lencana **"Rute OpenRouteService"**.
3. P3 (Sari): segmen **"Hambatan"** → panel **Hambatan Jalan** (kiri atas) terbuka → klik peta di **KOORDINAT_HAMBATAN** → modal form → jenis *Perbaikan/galian jalan*, radius 60 m, keterangan **T4**, berlaku default 7 hari → **"Simpan hambatan"**.
4. P4: klik **"Hitung ulang rute"** (atau muat ulang) → garis **berubah**, teks **"Menghindari 1 hambatan: Galian saluran"**.
5. (Opsional, ≤ 20 dtk) tombol **"Rute angkutan umum ke lokasi"** → hasil TransJakarta/KRL/MRT/LRT dari mesin rute SmartRoute (M15). Notifikasi push "Kamu ditugaskan…" muncul di HP Dimas bila online (M17).
6. (Opsional bila waktu) **"Bandingkan moda"** → tabel jalan kaki / sepeda / motor-mobil berlabel perkiraan.
- **Kalimat:** "Rute ke lokasi aksi memperhitungkan hambatan yang ditandai komunitas atau kelurahan, dan hambatan kedaluwarsa otomatis tidak dipakai."
- **Cadangan:** ORS gagal → saklar `ROUTING_MODE=cache` (rute direkam saat gladi dengan dan tanpa hambatan) → lencana "Rute tersimpan". Cache juga gagal → garis lurus berlabel jujur, jelaskan.

### Langkah 6 — Bukti + verifikasi (4:20–5:10) · P4 → P3 → P2

1. P4: **"Saya sudah tiba"** → status aksi **Berjalan**.
2. Bagian bukti: **"Foto sebelum"** → **"Pakai foto laporan"**; **"Foto sesudah"** → `sampah-after.jpg` → keduanya tampil berdampingan.
3. P3: **"Ajukan verifikasi"** → dialog jam: Dimas 2 jam, perkiraan sampah 40 kg → **"Ajukan"** → banner "Bukti sedang diperiksa…". Tunjukkan sebentar bahwa sebelum foto sesudah ada, tombol menampilkan "Unggah minimal 1 foto sesudah…" (cukup sebut, tidak diulang).
4. P2: segmen **"Bukti"** → kartu aksi → **"Sah — masalah selesai"** → toast "Bukti sah. Laporan #… selesai."
5. P1 (Rina): muat ulang detail laporan → banner hijau "Masalah ini sudah selesai dan buktinya diverifikasi." + timeline lengkap.
- **Kalimat:** "Selesai bukan tombol, tetapi bukti yang diverifikasi orang lain. Pengunggah tidak bisa memverifikasi buktinya sendiri."
- **Cadangan:** unggah gagal → buka aksi seed **A05** (L05) yang sudah `menunggu_verifikasi`, lalu verifikasi dari P2.

### Langkah 7 — Dashboard (5:10–5:40) · P2 Moderator Budi → `/dashboard`

1. Buka **"Dampak"** (layout dashboard lama: 4 kartu KPI + ringkasan status + laporan prioritas) → banner "Angka ini berasal dari data sintetis…" → kartu *Tingkat penyelesaian*, *Jam relawan*, *Perkiraan sampah terangkut* dan hitungan *Selesai* di ringkasan status sudah berubah dari langkah 6; arahkan kursor ke ikon "i" → rumus.
2. Tunjuk kartu **"Token AI per laporan"** dan **"Pelanggaran keselamatan (harus 0)"** di bawah grid (metrik ini hanya untuk pengguna login, karena itu langkah ini memakai P2, bukan tab tamu).
- **Kalimat:** "Dampak dihitung langsung dari data, dengan rumus terbuka — termasuk biaya AI-nya."
- **Cadangan:** angka tidak berubah → muat ulang; bila tetap, tunjukkan rumus dan lanjut.

### Langkah 8 — Cabang instansi (5:40–6:20) · P1 → P2

1. P1: segmen **"Lapor"** → tab **"Isi formulir"** → kategori *Jalan & trotoar* → tempel **T5** → titik dekat halte (pin gladi) → foto `trotoar.jpg` → **"Kirim laporan"** → label awal: *Perlu instansi*.
2. P2: Moderasi → kartu laporan trotoar di panel antrian → modal → dropdown **"Teruskan ke instansi"** → pilih **SP4N-LAPOR!** → **"Teruskan"** → halaman rujukan: peringatan "SUSI Connect tidak terhubung langsung ke instansi…", draf terstruktur dengan koordinat → **"Salin draf"** → toast "Draf disalin."
- **Kalimat:** "Kami tidak memaksakan relawan pada kewenangan instansi, dan tidak mengklaim terhubung langsung. Warga mendapat laporan yang lengkap dan kanal yang benar."
- **Cadangan:** pakai **L10** (sudah menunggu, instansi) atau **L11** (sudah diteruskan).

### Langkah 9 — Etika & penutup (6:20–7:00) · Slide + `/tentang-ai`

- Buka **"Tentang AI"** 5 dtk: data yang dikirim/tidak dikirim, status mode.
- Slide penutup: EXIF dihapus, lokasi publik ± 100 m, tanpa PII ke AI, aturan bahaya, mode offline; roadmap (moda umum, percontohan kelurahan).
- **Kalimat:** "Satu alur: lapor, cocokkan, kerjakan, buktikan — dengan manusia tetap memegang keputusan."

### Cadangan Q&A (3 menit) — layar siap di tab tersembunyi

| Pertanyaan | Tunjukkan |
| --- | --- |
| Laporan berbahaya? | **L13** di Moderasi: pita merah "Jangan ditangani relawan tanpa petugas", tombol Verifikasi nonaktif |
| Laporan palsu/duplikat? | **L15**: "Kemungkinan duplikat (1) · 42 m"; **L14** ditolak dengan alasan |
| Laporan campuran? | **L12**: diverifikasi + kartu rujukan "Bersama aksi komunitas" |
| Kalau internet mati? | Jalankan saklar cadangan dan ulangi langkah 2 dalam 30 dtk |
| Peran salah? | P4 (relawan) buka `/moderasi` → "Halaman ini hanya untuk moderator." |

---

## 2. Video demo 3–5 menit (tanpa narasi)

Rekam 1080p, 30 fps, kursor besar, teks keterangan di layar (font ≥ 32 px, 2–4 dtk tiap teks), musik bebas royalti pelan, tanpa suara narasi. Rekam per langkah lalu sunting; gunakan data seed segar.

| Waktu | Adegan | Teks di layar |
| --- | --- | --- |
| 0:00–0:15 | Judul + logo | "SUSI Connect — dari laporan warga ke aksi yang terbukti selesai" |
| 0:15–0:30 | Slide masalah | "Laporan sering tidak jelas siapa yang mengerjakan dan apakah selesai" |
| 0:30–1:15 | Langkah 2 | "Warga bercerita → AI menyusun draf → warga mengonfirmasi" · "Fitur AI: ekstraksi laporan (Gemini)" |
| 1:15–1:40 | Langkah 3 | "Label awal AI + alasan" · "Moderator mengoreksi, koreksi tercatat" |
| 1:40–2:20 | Langkah 4 | "Rekomendasi komunitas dengan skor terbuka" · "Fitur AI: draf rencana aksi + catatan keselamatan" |
| 2:20–2:55 | Langkah 5 | "Rute ke lokasi aksi (OpenRouteService)" · "Hambatan ditambahkan → rute berubah" |
| 2:55–3:30 | Langkah 6 | "Bukti before/after" · "Diverifikasi orang lain → Selesai" |
| 3:30–3:50 | Langkah 8 | "Masalah kewenangan instansi → draf siap kirim ke kanal resmi" · "Tanpa klaim integrasi" |
| 3:50–4:10 | Langkah 7 + chatbot | "Dashboard dari data (sintetis)" · "Chatbot menjawab seputar aplikasi" |
| 4:10–4:25 | Mode cadangan | "Internet mati? Mode cadangan dengan label jujur" |
| 4:25–4:40 | Tentang AI | "AI hanya memberi saran · Data pribadi tidak dikirim ke AI" |
| 4:40–4:50 | Penutup | "github.com/<org>/susi-connect · Data demo sintetis" |

Fitur AI yang **wajib** terlihat (syarat lomba): chat → draf (Gemini), label triase + "Kenapa?", draf rencana aksi, draf instansi, chatbot FAQ. Unggah video paling lambat Jumat 13 Nov 23.00 (TICKETS PM-14).

---

**Catatan perangkat per langkah:** langkah 2, 8 (P1) di HP-A; langkah 4 dan hambatan di langkah 5 (P3) di HP-B; langkah 5–6 relawan (P4) di HP-C; langkah 3, verifikasi bukti di langkah 6, dan langkah 7 (P2) di web laptop. Nama tombol mengikuti UI-SPEC bagian M (tab bawah: "Lapor", "Rekomendasi", "Aksi", "Hambatan"; detail aksi bertab "Tugas/Rute/Bukti"). Video demo (§2) wajib menampilkan aplikasi di HP sebagai produk utama.

## 3. Pembagian peran saat tampil

| Orang | Tugas |
| --- | --- |
| PM | Presenter, pegang waktu (timer ponsel di meja), kalimat kunci |
| FS | Operator laptop utama, ganti profil, saklar cadangan |
| BE | Pantau terminal backend; siap menjawab pertanyaan teknis/AI |
| DA | Pegang laptop cadangan & slide; menjawab pertanyaan metrik & data |
