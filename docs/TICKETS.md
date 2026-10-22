# TICKETS SUSI Connect — Rencana Kerja per Hari

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.2 · **Pemilik:** PM
**Dirujuk dari:** PRD §17 · DoD umum: SDD §11 · Strategi git: SDD §12

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru, menggantikan rencana per hari PRD v1 §17 (yang salah satu hari dan memakai peran "AI" & "UI/UX" yang tidak ada di tim). Kapasitas dihitung ulang dengan jawaban tim: 10 jam/hari (dengan bantuan AI), DA mengambil sebagian tiket backend & frontend sederhana, tanpa pemangkasan Must. |
| 1.1 | 22 Okt 2026 | Frontend mempertahankan tampilan & layout smartroute-dashboard: FS-01 tidak lagi membuang halaman/komponen lama, FS-04 jadi adaptasi tema (4 → 3 j), FS-06/FS-12/FS-18 memakai komponen lama (FS-12 4 → 3 j, FS-18 3 → 2 j), FS-21 menjadi `MapWorkspace` dasar (2 → 4 j), tiket baru FS-33 (responsif, 3 j), layar Rekomendasi dipindah ke DA (FS-13 → DA-21). |
| 1.2 | 22 Okt 2026 | Hasil audit: FS-01 juga memperbaiki build (`baseUrl`, T14); DA-05 memakai cek magic bytes karena `file-type` ESM-only. Jam tidak berubah. |

---

## 0. Kapasitas vs beban (dikatakan terus terang)

**Asumsi kapasitas** [ASUMSI dari jawaban tim "10+ jam, dibantu AI"]: Sabtu 7 Nov 5 jam (terpotong mentoring & technical meeting), Minggu–Jumat 10 jam/hari, Sabtu 14 Nov 5 jam (submission) → **70 jam per orang, 280 jam tim**. Bantuan AI coding mempercepat menulis kode tetapi tidak menghapus waktu review, uji, dan integrasi; estimasi di bawah sudah memperhitungkan itu [ASUMSI].

| Pemilik | Beban 7–14 Nov (Must + S06) | Kapasitas | Selisih | Puncak per hari | Sebelum 7 Nov | Should belum terjadwal |
| --- | --- | --- | --- | --- | --- | --- |
| FS — Full stack + DevOps | 70 j | 70 j | 0 j | 12 j (Sel) | 9 j | 7 j |
| BE — Backend + AI | 67 j | 70 j | −3 j | 11 j (Kam) | 5 j | 6 j |
| DA — Data Analyst | 66 j | 70 j | −4 j | 11 j (Rab, Kam) | 10 j | — |
| PM — Project Manager + UI/UX | 45 j | 70 j | −25 j | 10 j (Jum) | 16 j | — |
| **Tim** | **248 j** | **280 j** | −32 j | | 40 j | 13 j |

**Kesimpulan:** semua Must muat **hanya** dengan tiga syarat: (1) jam kerja 10 jam/hari benar-benar tersedia; (2) DA mengerjakan tiket backend & frontend sederhana (upload/foto, geo/hambatan, match API, notifikasi, komunitas/kanal/admin API, layar Dampak, Rekomendasi, Rujukan, Chatbot) — sesuai keputusan tim; (3) FS bekerja 12 jam pada Selasa 10 Nov (pembuatan `MapWorkspace`). Tidak ada cadangan waktu untuk kejutan selain bug buffer Jumat malam–Sabtu (FS-29, BE-22). **Should (13 j) belum muat** di kapasitas FS; sisa kapasitas BE (3 j) dipakai untuk BE-23 bila Checkpoint 2 lulus. Sisa kapasitas PM (25 j) dipakai untuk uji manual, dokumentasi, dan video, bukan kode — tim tidak memilih PM ikut ngoding.

**Sesuai keputusan tim, tidak ada tiket Must yang dipangkas.** Bila Checkpoint 1 (Senin 21.00) atau Checkpoint 2 (Rabu 21.00) meleset, langkah yang tersedia adalah: memindahkan tiket ke DA/PM, menunda Should, menambah jam. Keputusan itu dicatat di `docs/notes/checkpoint-*.md`.

**Jalur kritis demo:** BE-02 → BE-03 → BE-07 → BE-08 → BE-09 → BE-10 → BE-11 → DA-07 → BE-15 → BE-16 → BE-17, paralel DA-09 → BE-18 → FS-17, dan FS-06 → FS-21 (`MapWorkspace`) → FS-12/DA-21/FS-18. Keterlambatan satu tiket di jalur ini menggeser gladi demo 1 (PM-11, Kamis).

## 1. Aturan tiket

- Ukuran ≤ 4 jam. Satu tiket = satu branch `<jenis>/<ID>-<slug>` = satu PR (SDD §12).
- **Definition of Done umum** (berlaku untuk semua tiket kode, selain DoD khusus di tabel): (1) kriteria Given/When/Then PRD terkait lulus; (2) uji unit/API terkait hijau di CI; (3) bila menyentuh AI/rute/peta, berjalan di mode cadangan; (4) teks UI sama dengan UI-SPEC, keluaran AI berlabel; (5) PR direview dan di-squash ke `main`.
- Tiket sebelum 7 Nov hanya pekerjaan **non-fitur**: riset, desain, data, wawancara, penyiapan repo & laptop. Penulisan kode fitur dimulai 7 Nov. Boleh/tidaknya menulis kode fitur sebelum 7 Nov ditanyakan di PRE-14 [PERLU DIVERIFIKASI].
- Standup 15 menit tiap pagi 08.00: kemarin, hari ini, hambatan. PM memperbarui kolom status di GitHub Projects.

## 2. Tiket per hari

### 2.1 Sebelum 7 Nov (22 Okt – 6 Nov)

Beban: FS 9 j · BE 5 j · PM 16 j · DA 10 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| PRE-01 | Buat monorepo susi-connect | `git subtree add` backend & web dari repo lama (SDD §2.4); salin `docs/` dan `db/migrations/`; README asal kode; proteksi branch `main`. | FS | — | 3 j | Repo GitHub ada; `git log` memuat riwayat kedua repo; `main` terproteksi (PR + CI + 1 review). |
| PRE-02 | Siapkan laptop demo & cadangan | Node LTS, PostgreSQL ≥ 16; jalankan migrasi 001–005 dengan `psql` di kedua laptop. | FS | PRE-01 | 2 j | Kelima migrasi jalan tanpa galat di 2 laptop; versi dicatat di README. |
| PRE-03 | Uji ekstrak PMTiles DKI | CLI `pmtiles extract` bbox DKI maxzoom 15; catat ukuran; unduh glyph & sprite (SDD §10.2). | FS | — | 3 j | Ukuran & versi alat tercatat di SDD §10.2; file disimpan di luar repo. |
| PRE-04 | Verifikasi Gemini | Dokumentasi resmi: model kelas Flash, kuota tier tim, structured output `@google/genai`, kebijakan data; buat API key; uji 1 panggilan dari skrip di luar repo. | BE | — | 3 j | Temuan menggantikan [PERLU DIVERIFIKASI] di AI-PROMPTS §1 & SDD §6.3; key di password manager tim. |
| PRE-05 | Verifikasi OpenRouteService | Buat key; `curl` directions `driving-car` + `avoid_polygons` di Tebet; catat kuota & batas poligon. | BE | — | 2 j | `docs/notes/ors.md` berisi contoh request/response; SDD §6.5 diperbarui. |
| PRE-06 | Wawancara & survei | Wawancara pengurus RT/RW, koordinator komunitas, relawan (target 5); sebar survei (target 30). | PM | — | 4 j | Catatan tanpa data pribadi; tautan survei tersebar. |
| PRE-07 | Data wilayah & kanal instansi | Cocokkan kelurahan Tebet & Setiabudi dengan data resmi; cari URL resmi JAKI; spreadsheet `areas`/`agencies` bersumber. | DA | — | 3 j | Sumber per baris; PRD §12.1/§12.4 diperbarui. |
| PRE-08 | Wireframe S01–S09 | Figma low-fi mobile-first sesuai UI-SPEC. | PM | — | 4 j | Semua elemen tabel UI-SPEC S01–S09 ada; dibagikan ke FS. |
| PRE-09 | Wireframe S10–S18 | Figma low-fi sisa layar. | PM | PRE-08 | 4 j | Semua elemen UI-SPEC S10–S18 ada. |
| PRE-10 | Set uji AI & kamus | 40 kasus sintetis berlabel (AI-PROMPTS §9); tinjau kamus §7. | DA | — | 4 j | Spreadsheet 40 kasus (8 bahaya, 5 injeksi); usulan kamus tercatat. |
| PRE-11 | Olah hasil validasi | Rekap survei & wawancara; status P1–P5. | DA | PRE-06 | 3 j | Ringkasan 1 halaman + angka apa adanya untuk PRD §3 & slide. |
| PRE-12 | Pilih titik demo | Bersama PM: titik laporan, Pos RW 05, TPS, kandidat titik hambatan yang memotong rute. | FS | PRE-05 | 1 j | Koordinat tercatat sementara di DEMO-SCRIPT §0. |
| PRE-13 | Draf FAQ & foto demo | Kerangka `faq.md` (≥ 10 bagian `[faq-id]`); 3 foto demo buatan tim tanpa wajah/plat. | PM | — | 3 j | Draf faq.md & foto di drive tim. |
| PRE-14 | Tanya panitia | Jam batas submission 14 Nov, format pengumpulan, boleh/tidaknya menulis kode fitur sebelum 7 Nov. | PM | — | 1 j | Jawaban tertulis tersimpan; SDD §12 & PRD §21 diperbarui. |

### 2.2 Sabtu 7 Nov — terpotong mentoring & technical meeting

Beban: FS 5 j · BE 4 j · PM 5 j · DA 4 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-01 | Bersihkan backend lama | Hapus route/controller/seed/simulator/dump lama (SDD §2.2); `app.js` + `index.js`; helmet, `cors({origin})`, `express.json`, `respond`, `AppError`, `errorHandler`. | BE | PRE-01 | 2 j | `npm run dev` jalan; `GET /api/health` 200; tidak ada referensi `stations`/`admins`. |
| BE-02 | Env, pool, migrasi | `config/env.js` (zod), `pool.js` dengan `DATABASE_URL`, `db/migrate.js`, skrip `db:migrate`. | BE | BE-01 | 2 j | Tanpa `JWT_SECRET` server gagal start; `db:migrate` membuat 5 migrasi + `schema_migrations`. |
| FS-01 | Bersihkan frontend lama (tanpa membuang UI) | Hapus hanya data/tipe domain stasiun (`data/stations.json`, tipe stasiun/armada/flag di `services/api.ts`, `useStations`, `FlagContext`), aset contoh, `FlagProvider` ganda, axios; **pertahankan** halaman & komponen untuk diadaptasi (SDD §2.3); ganti Google Fonts dengan fontsource (T13); hapus `baseUrl` di `tsconfig.app.json` (T14, build asli gagal); `.gitignore`; `lang="id"`. | FS | PRE-01 | 2 j | `npm run build` (termasuk `tsc -b`) hijau; tanpa internet font tetap Plus Jakarta Sans/Source Code Pro. |
| FS-02 | apiClient, types, labels | `lib/apiClient.ts`, `lib/types.ts` (SDD §8.1), `lib/labels.ts` (PRD §8). | FS | FS-01 | 3 j | `tsc` hijau; label semua nilai PRD §8 ada. |
| PM-01 | Catat hasil mentoring & TM | Ringkas masukan mentor/aturan TM; ubah keputusan bila perlu. | PM | — | 2 j | Catatan di `docs/notes/`; perubahan tercatat di Log Perubahan dokumen terkait. |
| PM-02 | Finalisasi wireframe | Terapkan masukan mentor ke wireframe S01–S06. | PM | PRE-09, PM-01 | 3 j | Wireframe S01–S06 bertanda "final". |
| DA-01 | Fixtures pengguna, komunitas, wilayah, kanal | `seed/fixtures/{areas,users,communities,members,agencies}.json` dari PRD §12.1–12.4. | DA | PRE-07 | 4 j | JSON valid; anggota tersedia 6/10/3; koordinat PRD §12.3. |

### 2.3 Minggu 8 Nov

Beban: FS 8 j · BE 9 j · PM 5 j · DA 8 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-03 | Middleware auth & validasi | `auth.js`, `roles.js`, `validate.js`, `validation/common.js`, `rateLimit.js` (SDD §5.2). | BE | BE-02 | 4 j | Uji unit middleware: 401/403/400/422 sesuai API.md §1. |
| BE-04 | Auth A1–A5 | Login, demo-login, demo-accounts, me, patch me; bcrypt; JWT `{sub, role}` 8 jam. | BE | BE-03 | 2 j | `api/auth.test.js` hijau (sukses, 401, 403 DEMO_DISABLED, 429). |
| BE-05 | Harness uji API | DB `susi_test`, migrasi + seed sebelum suite, helper login per persona, `rbac.test.js` berbasis tabel route. | BE | BE-04, DA-02 | 3 j | `npm test` menjalankan unit + api; tabel RBAC diisi per tiket. |
| FS-03 | AuthContext, guard, AppShell | `AuthContext` (user, persona), `ProtectedRoute` roles/communityRole, `AppShell` + menu per persona + lonceng (kosong dulu). | FS | FS-02, BE-04 | 4 j | Menu sesuai UI-SPEC §0; route terlindungi → `/login?next=`. |
| FS-04 | Adaptasi tema lama & komponen dasar | Tambah token SDD §8.7 ke `@theme` lama; badge status/urgensi, dialog, toast, EmptyState, ErrorState, skeleton bergaya kartu lama. | FS | FS-01, PM-02 | 3 j | Halaman contoh komponen lolos kontras AA (axe). |
| FS-10 | Worker MapLibre lokal | Ubah `map.tsx` baris 25–29 (SDD §10.1). | FS | FS-01 | 1 j | Network offline: tidak ada request ke unpkg. |
| DA-02 | Seed runner dasar | `seed/seed.js`: hapus data sintetis berurutan, upsert areas/kategori, muat fixtures DA-01, hash sandi (SDD §6.9). | DA | BE-02, DA-01 | 4 j | `npm run seed` < 1 menit, idempoten. |
| DA-03 | matching.score + uji | Fungsi murni `score` + `round3` epsilon (SDD §6.4) + `tests/unit/matching.test.js`. | DA | — | 4 j | Uji: 0,963 / 0,748 / 0,657; kasus bahaya & K=0 tidak lolos. |
| PM-03 | Konten FAQ & Tentang AI | `faq.md` final (≥ 12 bagian) + teks UI-SPEC S15. | PM | PRE-13 | 4 j | File di `backend/src/services/ai/faq.md`; teks S15 final. |
| PM-04 | Papan tugas & standup | Isi GitHub Projects dari TICKETS.md; jadwal standup 15 menit tiap pagi. | PM | PRE-01 | 1 j | Semua tiket ada di papan dengan pemilik. |

### 2.4 Senin 9 Nov — Checkpoint 1 pukul 21.00

Beban: FS 10 j · BE 10 j · PM 7 j · DA 10 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-07 | Laporan R1–R4 + meta | Create multipart, list terfilter peran, public (view), detail + serializer; Z1, Z3, Z4. | BE | BE-05, DA-05 | 4 j | `api/reports.create.test.js`, `reports.public.test.js`, `meta.test.js` hijau. |
| BE-08 | aiService inti | `aiService.run`, `gemini.js`, `schemas.js` (6 tujuan), timeout, log `ai_analyses`, pembaca ai-cache, `redact.js`, allowlist. | BE | PRE-04, BE-02 | 4 j | Unit: JSON invalid → fallback; timeout → fallback; payload tanpa PII. |
| BE-09 | triage.job | Jalan setelah commit R1/C3; lanjutkan `pending` saat start; notifikasi moderator (stub `enqueue`). | BE | BE-08, DA-04 | 2 j | `api/triage.test.js`: `ai_status` berubah; restart memproses pending. |
| FS-05 | Halaman masuk S01 | Form + akun demo + redirect per persona. | FS | FS-03 | 2 j | Teks & state UI-SPEC S01; login demo jalan. |
| FS-06 | BaseMap & ReportMarker | `Map3DToggle` lama → `BaseMap` (center/bounds env, 3D hanya online, `theme=dark`); `ReportMarker` dari marker berdenyut lama (warna urgensi, bentuk status); `PointPicker`. | FS | FS-04, FS-10 | 3 j | Titik bisa dipilih; di luar DKI ditolak di UI; marker punya bentuk per status. |
| FS-07 | Formulir laporan S03-B | `ReportForm`, `PhotoPicker` (kompresi 1280 px), wilayah dari Z3. | FS | FS-06, BE-07 | 3 j | Validasi per field UI-SPEC; laporan tersimpan via R1. |
| FS-24 | Banner mode cadangan | `useHealth` (Z1, 60 dtk), `FallbackBanner`, berkas `.env.offline` contoh. | FS | FS-03, BE-07 | 2 j | Banner muncul saat `AI_MODE=fallback`. |
| DA-04 | Fallback & kamus | `dictionaries.js` (AI-PROMPTS §7), `fallback.js` per tujuan, `applyHardRules` + uji (review BE). | DA | PRE-10, BE-08 | 4 j | `unit/fallback.test.js`, `hardRules.test.js` hijau; 8 kasus bahaya → instansi. |
| DA-05 | Upload & foto | `upload.js` (multer memory 5 MB), `photo.service` (magic bytes via `lib/magic.js`, sharp WebP 1280, tanpa EXIF), route `/files/*` dengan cek hak. | DA | BE-03 | 3 j | Uji: 413, 415, EXIF hilang; Z2 401/404. |
| DA-06 | rankAndStore | Query kandidat + simpan match + uji integrasi dengan seed (SDD §6.4). | DA | DA-03, DA-02 | 3 j | Laporan demo menghasilkan 3 match urut di DB uji. |
| PM-05 | Uji Checkpoint 1 & teks S01–S06 | Lapor → triase → verifikasi → matching manual (verify via API bila UI belum); review `labels.ts`. | PM | BE-09, FS-07 | 3 j | Laporan checkpoint (lulus/gagal per GWT) di `docs/notes/`. |
| PM-06 | Slide presentasi v1 | Slide masalah (data PRE-11), etika, penutup, roadmap. | PM | PRE-11 | 4 j | Slide v1 dibagikan; angka hanya dari PRE-11. |

### 2.5 Selasa 10 Nov

Beban: FS 12 j · BE 10 j · PM 5 j · DA 10 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-10 | State machine laporan | `reportStatus.config.js` + `transition()` + uji semua event (SDD §6.1). | BE | BE-07 | 4 j | `unit/reportStatus.test.js` mencakup 10 event sah & tidak sah. |
| BE-11 | Verify R5 (+campuran) | Override, `rankAndStore`, rujukan campuran + draf AI setelah commit. | BE | BE-10, DA-06 | 2 j | `api/moderation.test.js` verify: sukses, HANDLING_MISMATCH, SELF_VERIFICATION, campuran. |
| BE-12 | Chat C1–C3 | Sesi, pesan + chat_extract + redirect_to_form, confirm multipart. | BE | BE-08, BE-07 | 4 j | `api/chat.test.js` hijau termasuk 404 sesi orang lain. |
| FS-08 | Chat-pelaporan S03-A | `ChatReporter`, `DraftCard`, kotak darurat, pindah ke formulir. | FS | FS-07, BE-12 | 4 j | State UI-SPEC S03-A (berpikir, fallback, 429, sukses). |
| FS-09 | Laporan saya & detail S04–S05 | `ReportCard`, `StatusTimeline`, `AiBadge`, `AiReason`, `HazardBanner`, polling triase. | FS | FS-04, BE-07 | 4 j | Label AI tampil ≤ 15 dtk setelah kirim. |
| FS-21 | MapWorkspace dasar + S02 | `pages/Map.tsx` → `MapWorkspace` (prop `mode`), `QueuePanel` dari Leaderboard, `ObstaclePanel` dari FlaggedStationsPanel, `ReportDetailModal` dari StationDetail, `ViewToggle` jadi navigasi persona; mode `publik` & `warga`. | FS | FS-06, BE-07 | 4 j | Tamu melihat titik dibulatkan + Ringkasan; warga di `/peta` melihat laporannya. |
| DA-07 | Match M1–M3, R11 | Daftar per komunitas, accept (match lain kedaluwarsa), decline (kandidat berikutnya). | DA | BE-11, DA-06 | 3 j | `api/matches.test.js` termasuk 409 & 403. |
| DA-08 | Fixtures laporan & aksi | L01–L15, A03–A05, bukti, hambatan H01–H04, foto (PRD §12.5–12.6), waktu relatif. | DA | DA-02, PRE-13 | 4 j | Seed memuat semua status; timeline wajar. |
| DA-09 | Geo & hambatan O1–O4 | `lib/geo.js` (haversine R = 6371,0088 km, circlePolygon, bboxAround), `obstacle.service`, route O1–O4. | DA | BE-03 | 3 j | `unit/geo.test.js`, `api/obstacles.test.js`. |
| PM-07 | Audit aksesibilitas tahap 1 | axe + uji keyboard S01–S05; catat temuan sebagai issue. | PM | FS-09 | 3 j | Issue a11y per layar dengan prioritas. |
| PM-08 | Review teks S06–S18 | Bandingkan string di kode dengan UI-SPEC. | PM | FS-09 | 2 j | Daftar perbedaan teks di issue. |

### 2.6 Rabu 11 Nov — Checkpoint 2 pukul 21.00

Beban: FS 10 j · BE 10 j · PM 5 j · DA 11 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-13 | Forward, reject, return, reopen | R6 (agency_draft sinkron + rujukan), R7, R8, R9; F1–F2. | BE | BE-10, BE-08 | 4 j | `api/moderation.test.js` lengkap R6–R9; `referrals.test.js` F1–F2. |
| BE-15 | Aksi X1–X3 + action-plan R12 | `actionStatus.config`, createAction, list, detail + `can`, action_plan AI. | BE | DA-07 | 4 j | `api/actions.test.js` X1–X3, R12, ALREADY_EXISTS. |
| BE-26 | CI GitHub Actions | `ci.yml`: lint + test backend (service postgres) + lint + build web. | BE | BE-05 | 2 j | PR menampilkan status CI. |
| FS-12 | Moderasi S06 (mode moderasi) | `QueuePanel` antrian, `ReportDetailModal` + `TriagePanel`, dropdown Verifikasi/Teruskan/Tolak + dialog. | FS | FS-21, FS-09, BE-11, BE-13 | 3 j | Semua state UI-SPEC S06. |
| DA-21 | Rekomendasi S08 (mode rekomendasi) | `QueuePanel` match + `ScoreBreakdown` di modal, terima/tolak. | DA | FS-21, DA-07 | 2 j | Rincian skor contoh 0,963 tampil benar. |
| FS-33 | MapWorkspace responsif | < 768 px: bottom sheet bertab untuk kedua panel, modal layar penuh, ViewToggle bar bawah, jam disembunyikan; hapus pesan "Buka website di desktop" (T4). | FS | FS-21 | 3 j | Alur warga & relawan nyaman di 360 px (uji DevTools). |
| FS-11 | Basemap offline | `mapStyle.ts`, protokol pmtiles, saklar `VITE_MAP_STYLE`, rencana B (SDD §10.2). | FS | PRE-03, FS-06 | 4 j | Wi-Fi mati: peta dasar tampil (atau rencana B). |
| DA-10 | metrics.service + K1 | Query SDD §6.6, label/rumus PRD §10, cakupan peran, `metrics.test.js`. | DA | DA-08, BE-03 | 4 j | K1 = SQL manual untuk seed. |
| DA-11 | Kalibrasi bobot | 20 laporan sintetis urutan ideal; usul bobot (tetap env). | DA | DA-06 | 2 j | Catatan kalibrasi; bobot final di `.env.example`. |
| DA-12 (Should) | Notifikasi N1–N3 (S06) | `notification.service` lengkap (ganti stub), route N1–N3, isi tabel SDD §6.8. | DA | BE-10 | 3 j | `api/notifications.test.js`. |
| PM-09 | Uji GWT M01–M06 + Checkpoint 2 | GWT PRD §9.2 M01–M06 di aplikasi; cek alur aksi → rute → bukti. | PM | PM-05 | 4 j | Tabel lulus/gagal per baris GWT. |
| PM-10 | Tetapkan titik hambatan demo | Bersama FS: koordinat & radius yang pasti memotong rute (DEMO-SCRIPT T4). | PM | PRE-12, DA-09 | 1 j | Koordinat final di DEMO-SCRIPT §0. |

### 2.7 Kamis 12 Nov

Beban: FS 10 j · BE 11 j · PM 6 j · DA 11 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-16 | Aksi X4–X7 + tugas T1–T6 | Update/start/submit/cancel; claim (FOR UPDATE), release, assign, checkin, complete. | BE | BE-15 | 4 j | `api/tasks.test.js`: dua klaim paralel → 1×200 + 1×409. |
| BE-17 | Bukti E1–E4 + rujukan F3–F4 | `verifyEvidence` (aksi → laporan selesai), bukti rujukan, complete referral. | BE | BE-16, DA-05, BE-13 | 4 j | `api/evidences.test.js`, `referrals.test.js`: SELF_VERIFICATION, EVIDENCE_REQUIRED. |
| BE-18 | route.service P1 | ORS + avoid_polygons + cache + garis lurus; ORS di-mock di uji (SDD §6.5). | BE | DA-09, PRE-05 | 3 j | `unit/route.test.js`, `api/routes.test.js`. |
| FS-14 | Buat aksi S09 | `ActionForm`, `TaskEditor`, catatan keselamatan, default titik kumpul (markas komunitas) & TPS (seed). | FS | DA-21, BE-15 | 4 j | Aksi demo dibuat dari draf AI. |
| FS-16 | Detail aksi S11 (tugas) | `TaskList`, `SafetyNotes`, ambil/lepas/tiba/selesai, koordinator mulai/batal. | FS | FS-14, BE-16 | 4 j | Tombol sesuai `can`. |
| FS-15 | Aksi saya S10 | Daftar aksi + saklar ketersediaan (A5). | FS | FS-09, BE-15 | 2 j | State UI-SPEC S10. |
| DA-13 | Komunitas, kanal, admin API | G1–G6, H1–H3, U1–U4. | DA | BE-03 | 4 j | `api/communities.test.js`, `admin.test.js`. |
| DA-14 | Eval AI | `tests/ai-eval/cases.json` dari PRE-10 + `npm run eval:ai`. | DA | DA-04, BE-08 | 3 j | Hasil live & fallback tercetak. |
| DA-15 | Dampak S14 | `MetricsGrid`, `MetricCard` (bungkus KpiCard), `SyntheticBanner`, filter peran. | DA | DA-10, FS-04 | 4 j | State UI-SPEC S14; tooltip rumus. |
| PM-11 | Gladi demo 1 (online) | DEMO-SCRIPT langkah 1–9 dengan timer. | PM | FS-16, BE-17 | 3 j | Catatan waktu per langkah + daftar bug. |
| PM-12 | README & sinkron dokumen | README root (jalan lokal, asal kode); perbarui dokumen ke implementasi aktual. | PM | BE-26 | 3 j | Clone bersih mengikuti README berhasil (diuji orang lain). |

### 2.8 Jumat 13 Nov — freeze 21.00

Beban: FS 9 j · BE 10 j · PM 10 j · DA 10 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-20 | FAQ C4 | FAQ live + fallback kata kunci. | BE | BE-08, PM-03 | 2 j | `api/faq.test.js`, `unit/faqFallback.test.js`. |
| BE-21 | Skrip demo & hardening | `ai:record`, `routes:export/import`, rate limit AI, tabel RBAC lengkap untuk semua route. | BE | BE-18, BE-20 | 3 j | `rbac.test.js` mencakup semua route API.md §2. |
| BE-27 | Admin S17 (frontend) | Tab pengguna, komunitas, kanal, log AI. | BE | DA-13, FS-04 | 3 j | Semua tab memanggil U/G/H; GWT M13-5. |
| BE-28 | Tentang AI S15 & Notifikasi S16 (frontend) | Halaman statis + status Z1; daftar notifikasi + lonceng. | BE | PM-03, DA-12 | 2 j | State UI-SPEC S15, S16. |
| FS-17 | RoutePanel & ObstacleLayer | `RoutePanel` (asal/tujuan/moda), `MapRoute`, `ObstacleLayer` di S11. | FS | FS-16, BE-18 | 4 j | Rute berubah setelah hambatan (GWT M09-2). |
| FS-18 | Hambatan S13 (mode hambatan) | `ObstaclePanel` tab Aktif/Menunggu + `ObstacleForm` di modal + cabut. | FS | FS-17, DA-09 | 2 j | State UI-SPEC S13. |
| FS-19 | Bukti & verifikasi S11/S07/S05 | `EvidenceUploader`, `BeforeAfter`, dialog ajukan, antrian S07, konfirmasi pelapor S05. | FS | FS-16, BE-17 | 3 j | GWT M10 lulus di UI. |
| DA-16 | Validasi dashboard | K1 vs SQL manual setelah alur demo. | DA | DA-10 | 2 j | Selisih 0. |
| DA-17 | Rujukan S12 (frontend) | Daftar & detail rujukan, salin draf, nomor tiket, bukti, selesai. | DA | BE-17, FS-04 | 3 j | GWT M07 lulus di UI. |
| DA-18 | Chatbot S18 (frontend) | Widget FAQ, saran cepat, tombol "Lapor lewat chat". | DA | BE-20, FS-04 | 2 j | State UI-SPEC S18. |
| DA-19 | Hasil eval & data Q&A | Tulis hasil eval apa adanya di README; jawaban metrik; siapkan laptop cadangan. | DA | DA-14 | 3 j | README "Evaluasi AI" berisi angka dari skrip. |
| PM-13 | Gladi offline + GWT M07–M14 | DEMO-SCRIPT dengan Wi-Fi mati. | PM | FS-11, BE-21 | 4 j | Lulus/gagal per langkah; bug kritis ditugaskan sebelum 21.00. |
| PM-14 | Rekam & sunting video | DEMO-SCRIPT §2; unggah paling lambat 23.00. | PM | PM-13 | 4 j | Video 3–5 menit, 5 fitur AI terlihat, tanpa narasi. |
| PM-15 | Latihan Q&A | PRD §19 + DEMO-SCRIPT cadangan Q&A. | PM | PM-11 | 2 j | Setiap pertanyaan punya penjawab. |

### 2.9 Sabtu 14 Nov — submission

Beban: FS 6 j · BE 3 j · PM 2 j · DA 2 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| FS-28 | Rilis | Uji clone bersih, CI hijau, tag `v1.0.0` (SDD §12). | FS | semua Must | 2 j | Tag terdorong ≥ 3 jam sebelum batas. |
| FS-29 | Perbaikan bug demo (FS) | Hanya bug yang menghalangi DEMO-SCRIPT; boleh dimulai Jumat malam. | FS | PM-13 | 4 j | Issue kritis FS tertutup; CI hijau. |
| BE-22 | Perbaikan bug demo (BE) | Sama dengan FS-29 untuk backend. | BE | PM-13 | 3 j | Issue kritis BE tertutup. |
| DA-20 | Cek label sintetis | Banner, nama "(sintetis)", slide tidak menyebut angka seed sebagai dampak nyata. | DA | DA-15 | 2 j | Checklist ditandatangani DA. |
| PM-16 | Submission | Isi formulir, tautan repo + tag + video; konfirmasi diterima. | PM | FS-28, PM-14 | 2 j | Bukti submission tersimpan. |

### 2.10 Should — hanya bila Checkpoint 2 lulus dan ada sisa kapasitas

Beban: FS 7 j · BE 6 j · PM 0 j · DA 0 j

| ID | Judul | Deskripsi | Pemilik | Dependensi | Estimasi | Definition of Done |
| --- | --- | --- | --- | --- | --- | --- |
| BE-23 | S03 duplikat | R10 + badge di R2. | BE | BE-07 | 2 j | `api/duplicates.test.js`. |
| BE-24 | S02 bandingkan moda (API) | P2 tiga profil paralel. | BE | BE-18 | 2 j | `api/routes.test.js` compare. |
| BE-25 | S04 cek foto | `photo_check` di job triase bila `PHOTO_CHECK_ENABLED`. | BE | BE-09 | 2 j | `unit/photoCheck.test.js`. |
| FS-30 | S05 samarkan foto | Kotak blur canvas di `PhotoPicker`, dukungan keyboard. | FS | FS-07 | 3 j | GWT S05. |
| FS-31 | S02 & S03 UI | Tabel bandingkan moda di S11; daftar duplikat di S06. | FS | FS-17, BE-23, BE-24 | 2 j | GWT S02, S03. |
| FS-32 | S01 konfirmasi hambatan (UI) | Tombol "Masih ada?" di S13; O2 untuk warga. | FS | FS-18 | 2 j | GWT S01. |

