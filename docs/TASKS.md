# TASKS SUSI Connect — Rincian Task per Fitur

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.5 · **Pemilik:** PM
**Sumber:** PRD v4.0 · SDD v4.0 · DESIGN v1.1 · API v1.3 · UI-SPEC v3.0 · AI-PROMPTS v1.1 · TICKETS v3.0 · AUDIT-SMARTROUTE-APP v1.1

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru: setiap tiket TICKETS.md dipecah menjadi task kecil per lapisan (backend, endpoint, AI, web UI, mobile UI, UX & teks, data, uji, ops) dan dikelompokkan per fitur PRD. Jam & jadwal tetap di TICKETS.md; dokumen ini tidak menambah jam. File `docs/tasks.csv` berisi data yang sama untuk diimpor ke GitHub Projects. |
| 1.1 | 22 Okt 2026 | Task desain dari DESIGN.md: token semantik & tema ikut sistem (FS-34, MB-25), uji kontras dua tema, checklist review desain; resep komponen merujuk DESIGN §6–7. |
| 1.2 | 22 Okt 2026 | Audit smartroute-app: task mobile memakai ulang app SmartRoute (subtree, ganti identitas, pangkas transit); task tema mobile diganti palet app SmartRoute. |
| 1.3 | 22 Okt 2026 | Detail task mobile menyebut file app SmartRoute yang dipakai ulang (apiConfig, withTimeout, CustomTabBar, crowd-map, currentLocation, NavPanel, assistant), nama env `EXPO_PUBLIC_API_BASE_URL`, paket yang perlu ditambah, dan penghapusan ngrok/Nominatim. |
| 1.4 | 22 Okt 2026 | Penanda **Dari app SmartRoute** di setiap task (Sebagian / Pola / Baru) beserta file asalnya, juga sebagai kolom di `tasks.csv` untuk filter di GitHub Projects. |
| 1.5 | 22 Okt 2026 | Perluasan MVP: fitur M15 (rute moda umum dari SmartRoute), M16 (admin mobile), M17 (push); task Should S02, S03, S05 kini punya tiket (MB-27, FS-35, MB-26); task pangkas tidak lagi menghapus layar rute. |

## Cara pakai

- **Satu task = satu langkah kerja yang bisa dicentang**, bagian dari satu tiket (kolom *Tiket*). Pemilik & hari mengikuti tiket induknya di TICKETS.md.
- Task dianggap selesai bila detail kecilnya terpenuhi **dan** kriteria Given/When/Then PRD §9 terkait lulus. Tiket selesai bila semua task-nya tercentang + DoD umum (TICKETS §1).
- Tampilan **wajib** memakai resep DESIGN.md (token semantik, dua tema). Teks UI, validasi, dan kode galat **wajib persis** dokumen rujukan; bila berbeda, ubah dokumennya dulu (PR `docs`).
- Sejak v1.5 semua task (termasuk Should S01–S06) sudah punya tiket terjadwal.
- **Dari app SmartRoute** (AUDIT-SMARTROUTE-APP.md): **Sebagian** = kode di `smartroute/` (setelah subtree menjadi `mobile/`) dipakai lalu diubah — buka file asalnya dulu sebelum menulis baru; **Pola** = hanya susunan/gaya yang ditiru; task tanpa penanda = **Baru** (ditulis dari nol). Tidak ada task yang sudah selesai sepenuhnya: pekerjaan yang benar-benar sudah ada (init Expo, NativeWind, plugin MapLibre & lokasi, font, `usesCleartextTraffic`, profil EAS) sudah tidak dijadikan task.

**Lapisan:** `DB` Database · `API` Endpoint · `SVC` Logika backend · `AI` AI · `WEB` Web UI · `MOB` Mobile UI · `UX` UX & teks · `DATA` Data · `TEST` Uji · `OPS` Ops/DevOps

## Ringkasan

| Kode | Fitur | Problem | Jumlah task |
| --- | --- | --- | --- |
| F0 | Fondasi repo, lingkungan & kerangka | semua | 29 |
| M01 | Autentikasi & RBAC dua tingkat | semua | 17 |
| M02 | Form laporan + foto tanpa EXIF | P1 | 20 |
| M03 | Chat-pelaporan → draf → konfirmasi | P1 | 11 |
| M04 | Triase AI + aturan bahaya + fallback | P2 | 9 |
| M05 | Moderasi: verifikasi, teruskan, tolak, koreksi triase | P1, P2 | 12 |
| M06 | Matching skor transparan | P3 | 9 |
| M07 | Rujukan instansi & jalur campuran | P2 | 10 |
| M08 | Aksi, tugas, penugasan + draf rencana AI | P3, P4 | 12 |
| M09 | Rute ORS menghindari hambatan + hambatan berkedaluwarsa | P5 | 10 |
| M10 | Bukti before/after + verifikasi pihak lain | P4 | 9 |
| M11 | Dashboard dampak | P4 | 10 |
| M12 | Chatbot FAQ | P1 | 5 |
| M13 | Transparansi AI | etika | 8 |
| M14 | Mode demo, seed sintetis, offline & jaringan | demo | 14 |
| M15 | Rekomendasi moda untuk umum (mesin rute SmartRoute) | P5 | 10 |
| M16 | Panel admin di aplikasi mobile | admin | 4 |
| M17 | Notifikasi push + cadangan in-app | P1 | 6 |
| S01 | Hambatan dari warga + konfirmasi (Should) | P5 | 2 |
| S02 | Perbandingan moda ke lokasi aksi (Should) | P5 | 2 |
| S03 | Deteksi duplikat (Should) | P1 | 2 |
| S04 | Cek kesesuaian foto (Should) | anti-palsu | 1 |
| S05 | Samarkan wajah/plat manual (Should) | privasi | 1 |
| S06 | Notifikasi in-app (Should, dijadwalkan) | P1 | 4 |
| X | Lintas fitur: tema, komponen, aksesibilitas, demo & submission | — | 21 |
| | **Total** | | **238** |

**Dari app SmartRoute:** 25 task **Sebagian**, 4 task **Pola**, 209 task **Baru**.

## F0 — Fondasi repo, lingkungan & kerangka

Problem: semua

- [ ] **F0-01** `OPS` **Buat repo GitHub `susi-connect` & push monorepo lokal** — Remote `origin`, push `main`; aktifkan proteksi branch: wajib PR, CI hijau, 1 review. *Rujukan:* SDD §2.4, §12. *Tiket:* PRE-01 · FS · PRE
- [ ] **F0-02** `OPS` **Pasang Node LTS & PostgreSQL ≥ 16 di laptop utama + cadangan** — Catat versi di README; buat DB `susi` dan `susi_test`. *Rujukan:* SDD §11. *Tiket:* PRE-02 · FS · PRE
- [ ] **F0-03** `OPS` **Tulis `.env.example` backend** — PORT, DATABASE_URL, JWT_SECRET, WEB_ORIGIN (daftar koma), UPLOAD_DIR, AI_MODE, GEMINI_API_KEY, GEMINI_MODEL, PHOTO_CHECK_ENABLED, ROUTING_MODE, ROUTING_ALLOW_STRAIGHT, ORS_API_KEY, ORS_BASE_URL, DEMO_MODE, PILOT_BOUNDS, MATCH_WEIGHTS, MATCH_MAX_KM — tanpa nilai rahasia. *Rujukan:* SDD §5.2. *Tiket:* BE-02 · BE · Sab 7
- [ ] **F0-04** `SVC` **Hapus kode domain lama backend** — Route/controller stations, fleets, flags, admins; `seed/*`; `simulator.js` + panggilannya; dump SQL. *Rujukan:* SDD §2.2. *Tiket:* BE-01 · BE · Sab 7
- [ ] **F0-05** `SVC` **Buat `app.js` + `index.js`** — `app.js` tanpa `listen` (untuk supertest); helmet; `cors({ origin: env.WEB_ORIGIN })`; `express.json({ limit: "100kb" })`; `app.set("trust proxy", 1)` untuk Cloudflare. *Rujukan:* SDD §5, §8A.6. *Tiket:* BE-01 · BE · Sab 7
- [ ] **F0-06** `SVC` **`lib/respond.js`, `lib/AppError.js`, `middleware/errorHandler.js`** — Envelope `{success,data,meta}` / `{success:false,data:null,error:{code,message,details}}`; pemetaan MulterError & kode pg 23505/23514; log tanpa body. *Rujukan:* SDD §5.2, API §1. *Tiket:* BE-01 · BE · Sab 7
- [ ] **F0-07** `SVC` **`config/env.js` dengan zod** — Server berhenti dengan pesan jelas bila JWT_SECRET < 32 karakter, DATABASE_URL kosong, atau AI/ORS live tanpa key. *Rujukan:* SDD §5.2. *Tiket:* BE-02 · BE · Sab 7
- [ ] **F0-08** `DB` **Ubah `db/pool.js` ke `DATABASE_URL`** — `new Pool({ connectionString })`; `dotenv` hanya di env.js. *Rujukan:* SDD §2.2. *Tiket:* BE-02 · BE · Sab 7
- [ ] **F0-09** `DB` **`db/migrate.js` + skrip `npm run db:migrate`** — Baca `../../db/migrations`, satu transaksi per file, catat `schema_migrations`, berhenti di file gagal. *Rujukan:* SDD §5.3. *Tiket:* BE-02 · BE · Sab 7
- [ ] **F0-10** `TEST` **Uji migrasi dari DB kosong** — Jalankan 001–005 di `susi` & `susi_test`; jalankan dua kali (idempoten di level migrate.js). *Rujukan:* SDD §5.3. *Tiket:* BE-02 · BE · Sab 7
- [ ] **F0-11** `TEST` **Harness uji API** — `tests/api/_setup.js`: migrasi + seed ke `susi_test`, helper `loginAs(persona)`, tabel route untuk RBAC. *Rujukan:* SDD §11. *Tiket:* BE-05 · BE · Min 8
- [ ] **F0-12** `OPS` **CI GitHub Actions** — Job backend (service postgres, migrate, `npm test`), job web (lint + `npm run build`), job mobile (`tsc --noEmit` + lint); jalan di setiap PR. *Rujukan:* SDD §11, §12. *Tiket:* BE-26 · BE · Sab 7
- [ ] **F0-13** `WEB` **Bersihkan frontend lama tanpa membuang UI** — Hapus `data/stations.json`, aset contoh, tipe stasiun di `services/api.ts`, `useStations`, `FlagContext`, `FlagProvider` ganda, axios, react-device-detect. *Rujukan:* SDD §2.3. *Tiket:* FS-01 · FS · Sab 7
- [ ] **F0-14** `WEB` **Font lokal** — Ganti 3 `<link>` Google Fonts di `index.html` dengan fontsource Plus Jakarta Sans & Source Code Pro (T13). *Rujukan:* SDD §2.1 T13. *Tiket:* FS-01 · FS · Sab 7
- [ ] **F0-15** `WEB` **Rename paket & metadata** — `package.json` name `susi-web`; `<html lang="id">`; judul "SUSI Connect"; favicon baru. *Rujukan:* SDD §2.3. *Tiket:* FS-01 · FS · Sab 7
- [ ] **F0-16** `WEB` **`.gitignore` web** — Tambah `.env`, `.env.*`, `!.env.example`. *Rujukan:* SDD §2.1 T10. *Tiket:* FS-01 · FS · Sab 7
- [ ] **F0-17** `WEB` **`web/.env.example`** — VITE_API_URL, VITE_DEMO_MODE, VITE_MAP_STYLE, VITE_MAP_CENTER, VITE_MAP_BOUNDS. *Rujukan:* SDD §11 (tabel env). *Tiket:* FS-01 · FS · Sab 7
- [ ] **F0-18** `WEB` **`shared/types.ts`, `shared/labels.ts`, `shared/validation.ts`** — Isi SDD §8.1; label PRD §8; batas field UI-SPEC; alias `@shared/*` di Vite & tsconfig. *Rujukan:* SDD §8.1, D17. *Tiket:* FS-02 · FS · Sab 7
- [ ] **F0-19** `WEB` **`lib/apiClient.ts` web** — Fungsi `api<T>()`, `ApiError`, event `auth:expired` saat 401, `fileUrl()` dengan `?token=`. *Rujukan:* SDD §8.2. *Tiket:* FS-02 · FS · Sab 7
- [ ] **F0-20** `MOB` **Subtree app SmartRoute ke `mobile/`** — `git subtree split --prefix=smartroute` di clone smartroute-app lalu `git subtree add --prefix=mobile`; riwayat tercatat. *Rujukan:* AUDIT §4, SDD §4.1. *Tiket:* MB-01 · FS · Sab 7 · ♻ *Sebagian dari app SmartRoute:* `smartroute/ (seluruh app)`
- [ ] **F0-21** `MOB` **Ganti identitas aplikasi** — `app.json` name/slug/scheme/`android.package`/owner/`extra.eas.projectId`, ikon & splash SUSI, teks izin lokasi UI-SPEC M. *Rujukan:* AUDIT §4. *Tiket:* MB-01 · FS · Sab 7 · ♻ *Sebagian dari app SmartRoute:* `app.json, eas.json, assets/`
- [ ] **F0-22** `MOB` **Pangkas fitur kepadatan & aset SmartRoute** — Hapus laporan kepadatan (`crowdService`, modal kepadatan, `RealTimeInfoCard`), `mockRoutes`, ngrok, `react-native-maps`; **pertahankan** layar rute/navigasi/halte untuk M15; `tsc --noEmit` hijau. *Rujukan:* AUDIT §4 v1.1. *Tiket:* MB-01 · FS · Sab 7 · ♻ *Sebagian dari app SmartRoute:* `daftar AUDIT §4 v1.1`
- [ ] **F0-23** `MOB` **Konfigurasi alias `@shared/*` di Metro/Babel** — `watchFolders` ke `../shared`; uji impor `labels` dari layar contoh. *Rujukan:* SDD §4.1. *Tiket:* MB-02 · FS · Min 8
- [ ] **F0-24** `MOB` **`mobile/src/services/apiClient.ts`** — Antarmuka sama dengan web, di atas `fetchWithTimeout` (`src/utils/withTimeout.ts` app SmartRoute); token SecureStore; base URL dari `apiConfig.ts`; upload `FormData {uri,name,type}`. *Rujukan:* SDD §8A.3. *Tiket:* MB-02 · FS · Min 8 · ♻ *Sebagian dari app SmartRoute:* `src/utils/withTimeout.ts`
- [ ] **F0-25** `MOB` **`mobile/.env.example`** — EXPO_PUBLIC_API_BASE_URL (nama dari app SmartRoute, tanpa `/api`), EXPO_PUBLIC_API_FALLBACK_URL, EXPO_PUBLIC_MAP_STYLE, EXPO_PUBLIC_DEMO_MODE; hapus URL ngrok dari `eas.json`. *Rujukan:* SDD §8A.6. *Tiket:* MB-02 · FS · Min 8 · ♻ *Sebagian dari app SmartRoute:* `src/services/apiConfig.ts, eas.json`
- [ ] **F0-26** `MOB` **Development build Android (EAS)** — Profil `development` di `eas.json` (sudah ada), package SUSI, `usesCleartextTraffic` (sudah ada) untuk IP hotspot; pasang di 3 HP. *Rujukan:* SDD §8A.7. *Tiket:* MB-03 · FS · Sen 9 · ♻ *Sebagian dari app SmartRoute:* `eas.json, app.json`
- [ ] **F0-27** `OPS` **Verifikasi ulang stack mobile** — Build app SmartRoute di akun EAS tim; catat status iOS & dukungan PMTiles MapLibre RN 11.3.8. *Rujukan:* AUDIT §3.1. *Tiket:* PRE-15 · FS · PRE · ♻ *Sebagian dari app SmartRoute:* `package.json, app.json, eas.json`
- [ ] **F0-28** `OPS` **Cloudflare Tunnel** — Named tunnel `susi` → `http://localhost:5000`; hostname `api.<domain>`; uji `/api/health` dari HP via data seluler. *Rujukan:* SDD §8A.6. *Tiket:* PRE-16 · BE · PRE
- [ ] **F0-29** `OPS` **Papan tugas** — Import `docs/tasks.csv` ke GitHub Projects; kolom Todo/Doing/Review/Done; label lapisan. *Rujukan:* TICKETS §1. *Tiket:* PM-04 · PM · Min 8

## M01 — Autentikasi & RBAC dua tingkat

Problem: semua

- [ ] **M01-01** `SVC` **`middleware/auth.js`** — `requireAuth`, `optionalAuth`; verifikasi HS256; muat user + `communities` + `is_synthetic` tiap request; `?token=` hanya di `/files/*`. *Rujukan:* SDD §5.2. *Tiket:* BE-03 · BE · Min 8
- [ ] **M01-02** `SVC` **`middleware/roles.js`** — `requireRole(...)` (admin lolos), `assertScope(user, kecamatan)`, `assertCommunity(user, id, memberRole?)` dengan pesan Indonesia. *Rujukan:* SDD §5.2. *Tiket:* BE-03 · BE · Min 8
- [ ] **M01-03** `SVC` **`middleware/validate.js` + `validation/common.js`** — Parse body/query/params (multipart lewat field `payload`), `OUT_OF_PILOT_AREA` → 422, galat zod → 400 dengan `details`. *Rujukan:* SDD §5.2, API §1.1. *Tiket:* BE-03 · BE · Min 8
- [ ] **M01-04** `SVC` **`middleware/rateLimit.js`** — Login 10/15 mnt/IP, AI 10/mnt/pengguna (FAQ per IP), umum 100/mnt/IP → 429 `RATE_LIMITED`. *Rujukan:* API §1. *Tiket:* BE-03 · BE · Min 8
- [ ] **M01-05** `API` **A1 `POST /auth/login`** — bcrypt cost 10; pesan sama untuk email tak terdaftar & sandi salah; `last_login`; audit `auth.login`. *Rujukan:* API A1. *Tiket:* BE-04 · BE · Min 8
- [ ] **M01-06** `API` **A2 `POST /auth/demo-login` & A3 `GET /auth/demo-accounts`** — Hanya `DEMO_MODE=true`; hanya akun `is_demo`; persona dihitung server (warga/relawan/koordinator/…). *Rujukan:* API A2–A3. *Tiket:* BE-04 · BE · Min 8
- [ ] **M01-07** `API` **A4 `GET /auth/me` & A5 `PATCH /auth/me`** — `communities` berisi `name` (join communities); A5 hanya `name`, `is_available`. *Rujukan:* API A4–A5. *Tiket:* BE-04 · BE · Min 8
- [ ] **M01-08** `TEST` **`api/auth.test.js`** — Sukses, 401 salah sandi, 403 DEMO_DISABLED, 404 akun non-demo, 429 setelah 10 percobaan. *Rujukan:* PRD §9.2 M01. *Tiket:* BE-04 · BE · Min 8
- [ ] **M01-09** `TEST` **`api/rbac.test.js`** — Untuk setiap route terlindungi: 401 tanpa token; 403 untuk satu peran yang salah; tabel diisi per tiket. *Rujukan:* PRD §11.2. *Tiket:* BE-21 · BE · Jum 13
- [ ] **M01-10** `WEB` **`AuthContext` web** — Simpan token + user; muat A4 saat start; `persona`, `isCoordinatorOf`, `isMemberOf`; dengarkan `auth:expired`. *Rujukan:* SDD §8.3. *Tiket:* FS-03 · FS · Min 8
- [ ] **M01-11** `WEB` **`ProtectedRoute` + route map web** — Props `roles`, `communityRole`; tanpa token → `/login?next=`; salah peran → halaman 403 "Halaman ini hanya untuk <peran>.". *Rujukan:* SDD §8.5. *Tiket:* FS-03 · FS · Min 8
- [ ] **M01-12** `WEB` **`AppShell` + `ViewToggle` navigasi persona** — Segmen per persona (UI-SPEC §0), lonceng, `LogoutButton` kanan bawah, `FallbackBanner`. *Rujukan:* UI-SPEC §0. *Tiket:* FS-03 · FS · Min 8
- [ ] **M01-13** `WEB` **Halaman masuk S01** — Restyle tema gelap; field email & sandi + tombol "Tampilkan"; kotak "Akun demo (data sintetis)"; redirect per persona. *Rujukan:* UI-SPEC S01. *Tiket:* FS-05 · FS · Sen 9
- [ ] **M01-14** `UX` **Teks & state S01** — "Email atau kata sandi salah."; "Terlalu banyak percobaan. Coba lagi dalam 15 menit."; tombol "Memproses…" saat memuat. *Rujukan:* UI-SPEC S01. *Tiket:* FS-05 · FS · Sen 9
- [ ] **M01-15** `MOB` **`AuthContext` mobile + SecureStore** — Token di `expo-secure-store`; pulihkan sesi saat buka aplikasi; 401 → kembali ke login dengan toast. *Rujukan:* SDD §8A.3. *Tiket:* MB-05 · PM · Sen 9
- [ ] **M01-16** `MOB` **Layar M-S01 + tab bawah per persona** — Daftar tombol akun demo; `CustomTabBar` app SmartRoute diubah ke tab UI-SPEC M0; admin melihat "Panel admin tersedia di web". *Rujukan:* UI-SPEC M0, M-S01, DESIGN §7.3. *Tiket:* MB-05 · PM · Sen 9 · ♻ *Sebagian dari app SmartRoute:* `src/components/CustomTabBar.tsx`
- [ ] **M01-17** `MOB` **Guard `RequireAuth`** — Logika sama dengan `ProtectedRoute` web. *Rujukan:* SDD §8A.4. *Tiket:* MB-05 · PM · Sen 9

## M02 — Form laporan + foto tanpa EXIF

Problem: P1

- [ ] **M02-01** `SVC` **`middleware/upload.js`** — multer memory, field `photos` (≤ 3) / `photo` (1), ≤ 5 MB → 413. *Rujukan:* API §1.1. *Tiket:* DA-05 · DA · Sen 9
- [ ] **M02-02** `SVC` **`lib/magic.js` `sniffImage(buf)`** — JPEG FF D8 FF, PNG 89 50 4E 47 0D 0A 1A 0A, WebP RIFF…WEBP; selain itu 415. *Rujukan:* SDD §6.7. *Tiket:* DA-05 · DA · Sen 9
- [ ] **M02-03** `SVC` **`photo.service.storeImage`** — sharp `.rotate().resize(1280 inside).webp({quality:78})`, nama UUID, tulis sebelum transaksi, `unlink` bila transaksi gagal. *Rujukan:* SDD §6.7. *Tiket:* DA-05 · DA · Sen 9
- [ ] **M02-04** `API` **Z2 `/files/report-photos/:id`, `/files/evidences/:id`** — Cek hak sama dengan R4/X3; `Cache-Control: private, max-age=3600`; 404 bila tak berhak. *Rujukan:* API Z2. *Tiket:* DA-05 · DA · Sen 9
- [ ] **M02-05** `API` **R1 `POST /reports`** — Skema zod R1; kelurahan harus ada di `areas`; judul otomatis 60 karakter awal deskripsi bila kosong; status `menunggu`, `ai_status=pending`; history `create`; audit; `is_synthetic = user.is_synthetic`. *Rujukan:* API R1, SDD §6.9 butir 6. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-06** `API` **R2 `GET /reports` terfilter peran** — warga → milik sendiri; moderator/instansi → kecamatan; anggota/koordinator → laporan aksi komunitasnya; `thumbnail_url`, `duplicate_candidates`. *Rujukan:* API R2. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-07** `API` **R3 `GET /reports/public` dari view** — bbox opsional, `status` boleh daftar koma, maks 500 baris, tanpa nama/foto/deskripsi. *Rujukan:* API R3. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-08** `API` **R4 `GET /reports/:id` + serializer** — `reporter.display_name` "Warga <kelurahan>"; history dengan `by_role`; ringkas `action` & `referral`; koordinat persis hanya peran berhak. *Rujukan:* API R4, §1.2. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-09** `API` **Z3 `/areas`, Z4 `/categories`, Z1 `/health`** — Z1 memuat `ai_mode`, `routing_mode`, `demo_mode`, `version`. *Rujukan:* API Z1, Z3, Z4. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-10** `TEST` **`api/reports.create.test.js`** — 201 valid; 400 deskripsi < 20; 422 titik Bandung; 415 PDF ganti nama; 413 6 MB; foto tersimpan tanpa EXIF GPS. *Rujukan:* PRD §9.2 M02. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M02-11** `MOB` **Layar M-S03B Formulir** — Kategori (kartu ikon dari Z4), deskripsi, judul opsional, patokan, kecamatan/kelurahan (Z3), tombol "Kirim laporan". *Rujukan:* UI-SPEC S03-B, M. *Tiket:* MB-08 · PM · Sel 10 · ♻ *Pola dari app SmartRoute:* `src/components/crowd/CrowdReportModal.tsx (alur 2 langkah)`
- [ ] **M02-12** `MOB` **Pilih titik di peta + GPS** — `PointPicker` di MapView; "Pakai lokasi saya" memakai `utils/currentLocation.ts` app SmartRoute tanpa reverse geocode Nominatim; tolak di luar DKI di UI. *Rujukan:* UI-SPEC S03-B, AUDIT §4. *Tiket:* MB-08 · PM · Sel 10 · ♻ *Sebagian dari app SmartRoute:* `src/utils/currentLocation.ts`
- [ ] **M02-13** `MOB` **Foto kamera/galeri + kompres** — Tambah paket `expo-image-picker` & `expo-image-manipulator` (belum ada di app SmartRoute); "Ambil foto"/"Pilih dari galeri", maks 3; ≤ 1280 px; cek ≤ 5 MB. *Rujukan:* SDD §8A.1. *Tiket:* MB-08 · PM · Sel 10
- [ ] **M02-14** `UX` **Teks izin lokasi/kamera/galeri** — Penjelasan sebelum dialog sistem + teks bila ditolak (UI-SPEC M). *Rujukan:* UI-SPEC M. *Tiket:* MB-08 · PM · Sel 10
- [ ] **M02-15** `UX` **Validasi per field & pesan** — "Pilih kategori", "Deskripsi minimal 20 karakter", "Tandai lokasi di peta", "Lokasi di luar wilayah pilot DKI Jakarta", "Ukuran foto maksimal 5 MB". *Rujukan:* UI-SPEC S03-B. *Tiket:* MB-08 · PM · Sel 10
- [ ] **M02-16** `UX` **Info privasi foto** — "Data lokasi (EXIF) di foto akan dihapus otomatis. Jangan unggah foto wajah orang lain.". *Rujukan:* UI-SPEC S03-B. *Tiket:* MB-08 · PM · Sel 10
- [ ] **M02-17** `UX` **Isian tidak hilang saat gagal kirim** — Simpan state form saat galat jaringan; tampilkan "Tidak bisa terhubung ke server…". *Rujukan:* PRD M02-7. *Tiket:* MB-08 · PM · Sel 10
- [ ] **M02-18** `MOB` **Laporan saya M-S04** — Daftar + filter chip (Semua/Menunggu/Diproses/Selesai/Ditolak); lencana "Perlu konfirmasi bukti" dari E4; kosong: "Kamu belum pernah melapor.". *Rujukan:* UI-SPEC S04. *Tiket:* MB-10 · PM · Rab 11 · ♻ *Pola dari app SmartRoute:* `src/components/HistoryCard.tsx, src/app/(tabs)/history.tsx`
- [ ] **M02-19** `MOB` **Detail laporan M-S05** — Header status/urgensi/sintetis, `HazardBanner`, panel label awal + "Kenapa?", galeri geser, peta kecil, timeline, kartu aksi/rujukan. *Rujukan:* UI-SPEC S05. *Tiket:* MB-10 · PM · Rab 11
- [ ] **M02-20** `MOB` **Polling triase** — R4 tiap 2 dtk maks 15 dtk saat `ai_status=pending`; teks "Sedang menyiapkan label awal…". *Rujukan:* SDD §6.3. *Tiket:* MB-10 · PM · Rab 11

## M03 — Chat-pelaporan → draf → konfirmasi

Problem: P1

- [ ] **M03-01** `API` **C1 `POST /chat/sessions`** — Mode `lapor` saja; pesan sistem pembuka disimpan. *Rujukan:* API C1. *Tiket:* BE-12 · BE · Sel 10
- [ ] **M03-02** `API` **C2 `POST /chat/sessions/:id/messages`** — Riwayat ≤ 10 pesan ke `chat_extract`; simpan `last_draft`; 2 fallback berturut → `redirect_to_form=true`; sesi orang lain → 404. *Rujukan:* API C2. *Tiket:* BE-12 · BE · Sel 10
- [ ] **M03-03** `API` **C3 `POST /chat/sessions/:id/confirm`** — Multipart seperti R1, `source=chat`, sesi `dikonfirmasi`, 409 bila sudah. *Rujukan:* API C3. *Tiket:* BE-12 · BE · Sel 10
- [ ] **M03-04** `AI` **Prompt & skema `chat_extract`** — Teks final AI-PROMPTS §2.1; zod §2.2; suhu 0,2. *Rujukan:* AI-PROMPTS §2. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M03-05** `AI` **Fallback `chat_extract`** — Kategori dari kamus, `lokasi_teks` dari regex "di/dekat/depan/samping", pertanyaan tetap per field kurang. *Rujukan:* AI-PROMPTS §7.5. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M03-06** `SVC` **`lib/redact.js`** — Sensor email, nomor HP `(\+62|62|0)8\d{7,11}`, NIK 16 digit → `[disensor]`. *Rujukan:* AI-PROMPTS §1. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M03-07** `TEST` **`api/chat.test.js` + `unit/redact.test.js`** — Draf demo kategori sampah; injeksi tidak mengubah status; nomor HP tersensor; 404 sesi orang lain. *Rujukan:* PRD M03. *Tiket:* BE-12 · BE · Sel 10
- [ ] **M03-08** `MOB` **Layar M-S03A ChatReporter** — Turunkan dari layar asisten SmartRoute (`assistant.tsx`): gelembung, input + "Kirim", indikator "…"; tab "Ceritakan"/"Formulir". *Rujukan:* UI-SPEC S03-A, AUDIT §3.1. *Tiket:* MB-09 · DA · Kam 12 · ♻ *Sebagian dari app SmartRoute:* `src/app/assistant.tsx, src/components/assistant/AssistantAnswerText.tsx`
- [ ] **M03-09** `MOB` **DraftCard** — Field bisa diedit: Judul, Ringkasan, Kategori, Patokan, Sejak, Urgensi; "Masih kurang: …"; lencana "Disusun oleh AI — periksa sebelum kirim". *Rujukan:* UI-SPEC S03-A. *Tiket:* MB-09 · DA · Kam 12
- [ ] **M03-10** `MOB` **Konfirmasi dari chat** — Titik peta + kelurahan + foto lalu C3; sukses → detail laporan + toast. *Rujukan:* UI-SPEC S03-A. *Tiket:* MB-09 · DA · Kam 12
- [ ] **M03-11** `UX` **State khusus chat** — Kotak merah 112 bila darurat; `off_topic` tanpa draf; `redirect_to_form` pindah tab dengan toast; 429 "Kamu mengirim terlalu cepat…". *Rujukan:* UI-SPEC S03-A. *Tiket:* MB-09 · DA · Kam 12

## M04 — Triase AI + aturan bahaya + fallback

Problem: P2

- [ ] **M04-01** `AI` **`gemini.js` pembungkus SDK** — Satu-satunya file yang memanggil `@google/genai` (CommonJS `require`); structured output; ambil `usageMetadata` token. *Rujukan:* SDD §6.3. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M04-02** `AI` **`aiService.run()`** — Allowlist + redaksi, `input_hash`, mode fallback → ai-cache → aturan, timeout 10 dtk, zod, `applyHardRules`, tidak pernah melempar. *Rujukan:* SDD §6.3. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M04-03** `AI` **`schemas.js` 6 tujuan** — zod + JSON schema manual untuk chat_extract, triage, action_plan, agency_draft, faq, photo_check. *Rujukan:* AI-PROMPTS §2–6. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M04-04** `AI` **Prompt `triage.txt`** — Teks final AI-PROMPTS §3.1; suhu 0,2. *Rujukan:* AI-PROMPTS §3. *Tiket:* BE-08 · BE · Sen 9
- [ ] **M04-05** `DATA` **`dictionaries.js`** — Kamus bahaya §7.1, kategori §7.2, urgensi §7.3, normalisasi singkatan (gk→tidak, udh→sudah, bgt→banget). *Rujukan:* AI-PROMPTS §7. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M04-06** `SVC` **`fallback.triage` + `applyHardRules`** — Bahaya → instansi, urgensi ≥ tinggi, keahlian [], relawan null; alasan "Ditentukan aturan kata kunci: …"; keyakinan 0,4. *Rujukan:* AI-PROMPTS §7.4. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M04-07** `SVC` **`triage.job.js`** — `setImmediate` setelah commit; resume `pending` saat start; `ai_status` done/fallback; notifikasi moderator wilayah. *Rujukan:* SDD §6.3. *Tiket:* BE-09 · BE · Sen 9
- [ ] **M04-08** `TEST` **`unit/fallback.test.js`, `unit/hardRules.test.js`, `unit/aiService.test.js`** — 8 kasus bahaya → instansi meski AI bilang komunitas; JSON invalid → fallback; payload tanpa nama/email/koordinat. *Rujukan:* PRD M04. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M04-09** `TEST` **`api/triage.test.js`** — `ai_status` berubah ≤ 15 dtk; restart memproses pending; notifikasi terbuat. *Rujukan:* PRD M04-5/6. *Tiket:* BE-09 · BE · Sen 9

## M05 — Moderasi: verifikasi, teruskan, tolak, koreksi triase

Problem: P1, P2

- [ ] **M05-01** `SVC` **`reportStatus.config.js`** — 10 event persis SDD §6.1 (create, verify, forward, reject, match_accept, action_cancelled, action_verified, agency_done, return, reopen). *Rujukan:* SDD §6.1. *Tiket:* BE-10 · BE · Sel 10
- [ ] **M05-02** `SVC` **`transition(client, id, event, actor, payload)`** — FOR UPDATE, cek from, aktor, override + hardRules, guard, UPDATE, history, override di ai_analyses, audit, notifikasi. *Rujukan:* SDD §6.1. *Tiket:* BE-10 · BE · Sel 10
- [ ] **M05-03** `TEST` **`unit/reportStatus.test.js`** — Setiap event sah & tidak sah; dua moderator bersamaan → satu 409. *Rujukan:* PRD M05-6. *Tiket:* BE-10 · BE · Sel 10
- [ ] **M05-04** `API` **R5 `POST /reports/:id/verify`** — Override opsional; `SELF_VERIFICATION`; triase pending → 409; `HANDLING_MISMATCH`; `rankAndStore`; campuran → rujukan + draf AI setelah commit. *Rujukan:* API R5. *Tiket:* BE-11 · BE · Sel 10
- [ ] **M05-05** `API` **R6 forward, R7 reject, R8 return, R9 reopen** — R6 draf AI sebelum transaksi; R7 alasan berkode + duplikat; R8 handling→komunitas + ranking ulang; R9 admin. *Rujukan:* API R6–R9. *Tiket:* BE-13 · BE · Rab 11
- [ ] **M05-06** `TEST` **`api/moderation.test.js`** — Semua GWT M05; reject tanpa catatan 400; reopen admin. *Rujukan:* PRD M05. *Tiket:* BE-13 · BE · Rab 11
- [ ] **M05-07** `WEB` **`MapWorkspace mode=moderasi`** — `QueuePanel` "Antrian Moderasi" (sort Terlama/Terbaru), marker laporan, klik → `ReportDetailModal`. *Rujukan:* UI-SPEC S06. *Tiket:* FS-21 · FS · Sel 10
- [ ] **M05-08** `WEB` **`TriagePanel` + dropdown aksi** — Kategori, urgensi, penanganan, penanda bahaya, keahlian, perkiraan relawan; tombol Verifikasi/Teruskan/Tolak dengan dialog. *Rujukan:* UI-SPEC S06. *Tiket:* FS-12 · FS · Rab 11
- [ ] **M05-09** `WEB` **Dialog teruskan & tolak** — Pilih kanal (H1) + catatan; alasan radio (Palsu/Duplikat/Di luar cakupan/Data kurang/Lainnya) + catatan 5–300. *Rujukan:* UI-SPEC S06. *Tiket:* FS-12 · FS · Rab 11
- [ ] **M05-10** `UX` **State moderasi** — Antrian kosong "Tidak ada laporan yang menunggu. Kerja bagus!"; triase pending tombol nonaktif; HANDLING_MISMATCH; "sudah diproses moderator lain"; toast sukses 3 jenis. *Rujukan:* UI-SPEC S06. *Tiket:* FS-12 · FS · Rab 11
- [ ] **M05-11** `MOB` **Moderasi M-S06** — Tab "Laporan"/"Bukti"; detail layar penuh; bar tombol bawah tetap. *Rujukan:* UI-SPEC M. *Tiket:* MB-11 · FS · Rab 11
- [ ] **M05-12** `WEB` **Admin: tab "Laporan ditolak" + Buka ulang** — R2 `status=ditolak`, dialog alasan banding. *Rujukan:* UI-SPEC S17. *Tiket:* BE-27 · BE · Jum 13

## M06 — Matching skor transparan

Problem: P3

- [ ] **M06-01** `SVC` **`matching.score()` murni** — K/A/W/J/T, `round3` dengan epsilon, `reasons` berbahasa Indonesia, `eligible`. *Rujukan:* SDD §6.4. *Tiket:* DA-03 · DA · Min 8
- [ ] **M06-02** `TEST` **`unit/matching.test.js`** — 0,963 / 0,748 / 0,657 dari koordinat seed; K=0 dan bahaya tidak lolos; est_volunteers null → T memakai 1. *Rujukan:* SDD §6.4. *Tiket:* DA-03 · DA · Min 8
- [ ] **M06-03** `SVC` **`rankAndStore(client, report, opts)`** — Query kandidat + `available`; filter keras; urut skor lalu jarak; rank lanjut; simpan `score_detail` dengan bobot. *Rujukan:* SDD §6.4. *Tiket:* DA-06 · DA · Sen 9
- [ ] **M06-04** `API` **R11, M1, M2, M3** — Koordinator hanya melihat komunitasnya; accept → laporan dikoordinasikan + match lain kedaluwarsa; decline → kandidat berikutnya / beri tahu moderator. *Rujukan:* API R11, M1–M3. *Tiket:* DA-07 · DA · Sel 10
- [ ] **M06-05** `TEST` **`api/matches.test.js`** — 409 sudah diterima komunitas lain; 403 anggota bukan koordinator. *Rujukan:* PRD M06. *Tiket:* DA-07 · DA · Sel 10
- [ ] **M06-06** `DATA` **Kalibrasi bobot** — 20 laporan sintetis urutan ideal; hasil & bobot final dicatat; tetap di `MATCH_WEIGHTS`. *Rujukan:* PRD §13. *Tiket:* DA-11 · DA · Rab 11
- [ ] **M06-07** `MOB` **Rekomendasi M-S08** — Daftar kartu (judul, kategori, urgensi, kelurahan, jarak, skor), tab Diusulkan/Diterima/Ditolak. *Rujukan:* UI-SPEC S08. *Tiket:* MB-12 · DA · Rab 11 · ♻ *Pola dari app SmartRoute:* `src/components/RouteCard.tsx (kartu skor)`
- [ ] **M06-08** `MOB` **`ScoreBreakdown`** — Tabel Komponen · Nilai · Bobot · Kontribusi + kalimat alasan digabung " · ". *Rujukan:* UI-SPEC S08. *Tiket:* MB-12 · DA · Rab 11
- [ ] **M06-09** `UX` **Terima/tolak** — Tolak wajib alasan 5–200; "Laporan ini sudah diterima komunitas lain."; sukses terima → layar buat aksi. *Rujukan:* UI-SPEC S08. *Tiket:* MB-12 · DA · Rab 11

## M07 — Rujukan instansi & jalur campuran

Problem: P2

- [ ] **M07-01** `AI` **Prompt `agency_draft` + placeholder** — `{{KOORDINAT}}` & `{{TANGGAL}}` diisi server; struktur 7 baris. *Rujukan:* AI-PROMPTS §5. *Tiket:* BE-13 · BE · Rab 11
- [ ] **M07-02** `AI` **Fallback templat rujukan** — Isi struktur §5.1 dari field laporan + deskripsi teredaksi. *Rujukan:* AI-PROMPTS §7.5. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M07-03** `API` **F1 daftar, F2 detail** — Cakupan kecamatan; `disclaimer` tetap; kanal + catatan. *Rujukan:* API F1–F2. *Tiket:* BE-13 · BE · Rab 11
- [ ] **M07-04** `API` **F3 `PATCH /referrals/:id`** — Status hanya maju; pelapor hanya `terkirim` + tiket; `sent_by/sent_at`. *Rujukan:* API F3. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M07-05** `API` **F4 complete + E2 bukti rujukan** — Hanya origin instansi; butuh bukti after sah → laporan selesai, rujukan ditindaklanjuti. *Rujukan:* API F4, E2. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M07-06** `API` **H1 `GET /agencies`** — Kanal kecamatan cocok dulu, lalu nasional. *Rujukan:* API H1. *Tiket:* DA-13 · DA · Kam 12
- [ ] **M07-07** `TEST` **`api/referrals.test.js`** — EVIDENCE_REQUIRED; instansi kecamatan lain 404; campuran tidak mengubah status laporan. *Rujukan:* PRD M07. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M07-08** `MOB` **Rujukan M-S12** — Peringatan tetap, kanal + "Buka <kanal>", draf + "Salin draf" (expo-clipboard), nomor tiket, tombol status, bukti, selesai, kembalikan (R8). *Rujukan:* UI-SPEC S12. *Tiket:* MB-18 · PM · Jum 13
- [ ] **M07-09** `WEB` **Salin draf di modal moderasi web** — Setelah teruskan, tampilkan draf + tombol salin + tautan kanal. *Rujukan:* UI-SPEC S06. *Tiket:* FS-12 · FS · Rab 11
- [ ] **M07-10** `UX` **Teks rujukan** — "SUSI Connect tidak terhubung langsung ke instansi. Kirim lewat kanal resmi di bawah."; "Draf disalin."; info campuran. *Rujukan:* UI-SPEC S12. *Tiket:* MB-18 · PM · Jum 13

## M08 — Aksi, tugas, penugasan + draf rencana AI

Problem: P3, P4

- [ ] **M08-01** `AI` **Prompt `action_plan` + `applyHardRules` rencana** — Buang tugas terlarang (alat berat, kimia, memanjat, listrik); pastikan catatan keselamatan standar. *Rujukan:* AI-PROMPTS §4, SDD §6.3. *Tiket:* BE-15 · BE · Rab 11
- [ ] **M08-02** `AI` **Fallback templat rencana** — Templat sampah, drainase, sosial, umum; `butuh_rute` ikut `ada_titik_buang`. *Rujukan:* AI-PROMPTS §7.5. *Tiket:* DA-04 · DA · Sen 9
- [ ] **M08-03** `SVC` **`actionStatus.config.js`** — ACTION_TRANSITIONS, TASK_TRANSITIONS, REFERRAL_ORDER persis SDD §6.2. *Rujukan:* SDD §6.2. *Tiket:* BE-15 · BE · Rab 11
- [ ] **M08-04** `API` **R12, X1, X2, X3** — Draf rencana; createAction (anggota penerima tugas harus anggota, unique aksi aktif); list per scope; detail + `can`. *Rujukan:* API R12, X1–X3. *Tiket:* BE-15 · BE · Rab 11
- [ ] **M08-05** `API` **X4–X7** — Ubah hanya direncanakan; start; submit butuh bukti after + jam & kg; cancel → laporan diverifikasi + ranking ulang tanpa komunitas ini. *Rujukan:* API X4–X7. *Tiket:* BE-16 · BE · Kam 12
- [ ] **M08-06** `API` **T1–T6** — Tambah tugas; claim FOR UPDATE + ON CONFLICT; release sebelum check-in; assign; check-in tanpa lokasi; complete. *Rujukan:* API T1–T6, SDD §6.2. *Tiket:* BE-16 · BE · Kam 12
- [ ] **M08-07** `TEST` **`api/actions.test.js`, `api/tasks.test.js`, `unit/actionStatus.test.js`** — Dua klaim paralel kuota 1 → 1×200 + 1×409; ALREADY_EXISTS; catatan keselamatan kosong 400. *Rujukan:* PRD M08. *Tiket:* BE-16 · BE · Kam 12
- [ ] **M08-08** `MOB` **Buat aksi M-S09 (3 langkah)** — Info → Titik (titik kumpul default markas komunitas, TPS dari seed) → Tugas & keselamatan; kotak draf AI + "Pakai draf". *Rujukan:* UI-SPEC S09, M. *Tiket:* MB-13 · FS · Kam 12
- [ ] **M08-09** `MOB` **`TaskEditor`** — Judul, keahlian, kuota, "Butuh rute (angkut)", tugaskan ke anggota (G2). *Rujukan:* UI-SPEC S09. *Tiket:* MB-13 · FS · Kam 12
- [ ] **M08-10** `MOB` **Aksi saya M-S10** — Tab Akan datang/Berjalan/Selesai; "Aksi komunitasmu yang butuh relawan"; saklar ketersediaan (A5). *Rujukan:* UI-SPEC S10. *Tiket:* MB-14 · FS · Kam 12
- [ ] **M08-11** `MOB` **Detail aksi M-S11 tab "Tugas"** — SafetyNotes selalu terlihat; ambil/lepas/"Saya sudah tiba"/selesai; koordinator: mulai, ubah (X4), tambah tugas (T1), tugaskan, batal. *Rujukan:* UI-SPEC S11. *Tiket:* MB-14 · FS · Kam 12
- [ ] **M08-12** `UX` **State aksi** — TASK_QUOTA_FULL "Tugas ini sudah penuh."; ALREADY_EXISTS; draf fallback "Draf ini templat standar…"; batal wajib alasan. *Rujukan:* UI-SPEC S09, S11. *Tiket:* MB-14 · FS · Kam 12

## M09 — Rute ORS menghindari hambatan + hambatan berkedaluwarsa

Problem: P5

- [ ] **M09-01** `SVC` **`lib/geo.js`** — haversine R = 6371,0088 km; `circlePolygon` 16 sisi; `bboxAround`. *Rujukan:* SDD §6.5. *Tiket:* DA-09 · DA · Sel 10
- [ ] **M09-02** `SVC` **`obstacle.service` + O1, O2, O4** — Aktif = status aktif & belum kedaluwarsa; `source_role` dihitung; maks 30 hari; poligon di respons. *Rujukan:* SDD §6.5, API O1–O4. *Tiket:* DA-09 · DA · Sel 10
- [ ] **M09-03** `SVC` **`route.service.getRoute` (P1)** — Titik asal → lokasi → dropoff; buang hambatan yang memuat titik; kunci cache geometri; ORS `avoid_polygons` 8 dtk; fallback garis lurus berlabel. *Rujukan:* SDD §6.5. *Tiket:* BE-18 · BE · Kam 12
- [ ] **M09-04** `TEST` **`unit/geo.test.js`, `unit/route.test.js` (ORS di-mock), `api/routes.test.js`, `api/obstacles.test.js`** — Rute berubah saat hambatan ditambah; kedaluwarsa diabaikan; cache kena setelah hambatan dibuat ulang; 403 bukan anggota. *Rujukan:* PRD M09. *Tiket:* BE-18 · BE · Kam 12
- [ ] **M09-05** `MOB` **MapView MapLibre RN v11** — Turunkan dari CrowdMapView/NavigateMap (`Map`, `Camera`, `Marker`, `GeoJSONSource`): marker laporan, poligon hambatan, garis rute (abu-abu bila straight). *Rujukan:* SDD §8A.5, AUDIT §3.1. *Tiket:* MB-06 · FS · Sel 10 · ♻ *Sebagian dari app SmartRoute:* `src/components/crowd/CrowdMapView.native.tsx, src/components/transit/AllStopsMapView.native.tsx, src/components/navigate/NavigateMap.native.tsx`
- [ ] **M09-06** `MOB` **Tab "Rute" di detail aksi** — Pola `NavPanel.tsx` app SmartRoute; asal "Lokasi saya"/"Titik kumpul", tujuan "Lokasi masalah"/"Lokasi → titik buang", moda; "x km · ± y menit (perkiraan)"; lencana sumber; "Menghindari n hambatan: …". *Rujukan:* UI-SPEC S11. *Tiket:* MB-15 · FS · Jum 13 · ♻ *Sebagian dari app SmartRoute:* `src/components/navigate/NavPanel.tsx`
- [ ] **M09-07** `MOB` **Hambatan M-S13** — Panel Aktif/Menunggu, tekan lama di peta untuk menaruh titik, form jenis/radius 10–500/keterangan/berlaku sampai, cabut. *Rujukan:* UI-SPEC S13, M. *Tiket:* MB-17 · DA · Kam 12
- [ ] **M09-08** `UX` **Teks rute & hambatan** — Kotak kuning garis lurus; "Izin lokasi ditolak. Rute dihitung dari titik kumpul."; "Maksimal 30 hari"; lencana "Kedaluwarsa" abu-abu. *Rujukan:* UI-SPEC S11, S13. *Tiket:* MB-15 · FS · Jum 13
- [ ] **M09-09** `WEB` **`ObstaclePanel` baca-saja di peta web** — Dari FlaggedStationsPanel lama, tab Aktif/Menunggu. *Rujukan:* UI-SPEC §0. *Tiket:* FS-21 · FS · Sel 10
- [ ] **M09-10** `DATA` **Titik hambatan demo** — Koordinat & radius yang memotong rute Pos RW 05 → lokasi → TPS; H01 di luar rute. *Rujukan:* DEMO-SCRIPT T4, PRD §12.6. *Tiket:* PM-10 · PM · Rab 11

## M10 — Bukti before/after + verifikasi pihak lain

Problem: P4

- [ ] **M10-01** `API` **E1 unggah bukti aksi** — Penerima tugas atau koordinator; before boleh `use_report_photo_id`; after hanya saat berjalan. *Rujukan:* API E1. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M10-02** `SVC` **`verifyEvidence` (E3)** — SELF_VERIFICATION sebelum update; moderator(W) atau pelapor; sah+after → aksi terverifikasi → laporan selesai; ditolak → aksi berjalan. *Rujukan:* SDD §6.2. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M10-03** `API` **E4 antrian bukti** — Moderator: menunggu di kecamatannya; warga: after untuk laporannya; sertakan `before_url`. *Rujukan:* API E4. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M10-04** `TEST` **`api/evidences.test.js`** — EVIDENCE_REQUIRED, SELF_VERIFICATION (juga CHECK DB), FORBIDDEN_SCOPE, alasan wajib bila ditolak. *Rujukan:* PRD M10. *Tiket:* BE-17 · BE · Kam 12
- [ ] **M10-05** `MOB` **Tab "Bukti" di detail aksi** — "Foto sebelum" (opsi pakai foto laporan) & "Foto sesudah" dari kamera; `BeforeAfter`; "Ajukan verifikasi" dengan jam per relawan & perkiraan kg. *Rujukan:* UI-SPEC S11. *Tiket:* MB-16 · PM · Kam 12
- [ ] **M10-06** `MOB` **Verifikasi oleh pelapor di M-S05** — "Apakah masalahnya sudah selesai?" → "Ya, sudah selesai" / "Belum, ada yang kurang" + alasan. *Rujukan:* UI-SPEC S05. *Tiket:* MB-10 · PM · Rab 11
- [ ] **M10-07** `MOB` **Verifikasi oleh moderator (tab Bukti M-S06)** — Sah/Tolak + alasan. *Rujukan:* UI-SPEC S07. *Tiket:* MB-16 · PM · Kam 12
- [ ] **M10-08** `WEB` **Verifikasi bukti web S07** — Antrian E4, BeforeAfter berdampingan, "Sah — masalah selesai"/"Tolak bukti". *Rujukan:* UI-SPEC S07. *Tiket:* FS-19 · FS · Jum 13
- [ ] **M10-09** `UX` **Teks bukti** — "Unggah minimal 1 foto sesudah sebelum mengajukan verifikasi."; "Bukti ini kamu unggah sendiri, jadi perlu diperiksa orang lain."; banner hijau selesai. *Rujukan:* UI-SPEC S05, S07, S11. *Tiket:* MB-16 · PM · Kam 12

## M11 — Dashboard dampak

Problem: P4

- [ ] **M11-01** `SVC` **`metrics.service.impact`** — Query SDD §6.6 + breakdown; cakupan peran; label & rumus dari PRD §10. *Rujukan:* SDD §6.6. *Tiket:* DA-10 · DA · Rab 11
- [ ] **M11-02** `API` **K1 `GET /metrics/impact`** — Publik 4 metrik + breakdown; login semua; moderator/instansi kecamatan terkunci; koordinator komunitasnya. *Rujukan:* API K1. *Tiket:* DA-10 · DA · Rab 11
- [ ] **M11-03** `TEST` **`api/metrics.test.js`** — K1 = SQL manual untuk seed; publik tanpa metrik login. *Rujukan:* PRD M11-6. *Tiket:* DA-10 · DA · Rab 11
- [ ] **M11-04** `WEB` **`DashboardPage` dari Dashboard.tsx** — 4 KpiCard, StatusSummaryCard (FlagSummaryCard), ActionsStatusCard (FleetStatusCard), ReportRankingCard (StationRankingCard) + filter kelurahan, MetricsGrid. *Rujukan:* UI-SPEC S14. *Tiket:* DA-15 · DA · Jum 13
- [ ] **M11-05** `WEB` **`KpiCard` prop `formula` + tooltip** — Ikon "i" berisi rumus; nilai null "—". *Rujukan:* UI-SPEC S14. *Tiket:* DA-15 · DA · Jum 13
- [ ] **M11-06** `WEB` **`SyntheticBanner`** — "Angka ini berasal dari data sintetis untuk demo, bukan dampak nyata.". *Rujukan:* UI-SPEC S02, S14. *Tiket:* DA-15 · DA · Jum 13
- [ ] **M11-07** `WEB` **Peta publik S02** — `MapClusterLayer` dari R3; QueuePanel "Ringkasan" berisi 4 KPI; filter status; catatan privasi. *Rujukan:* UI-SPEC S02. *Tiket:* FS-21 · FS · Sel 10
- [ ] **M11-08** `MOB` **Dampak M-S14** — 4 KPI + ringkasan status dari breakdown. *Rujukan:* UI-SPEC M. *Tiket:* MB-19 · PM · Kam 12
- [ ] **M11-09** `MOB` **Peta & beranda M-S02** — Turunkan `crowd-map.tsx` app SmartRoute: peta laporan publik/sendiri, bottom sheet ringkasan, tombol "+ Lapor". *Rujukan:* UI-SPEC M, AUDIT §3.1. *Tiket:* MB-07 · FS · Jum 13 · ♻ *Sebagian dari app SmartRoute:* `src/app/crowd-map.tsx`
- [ ] **M11-10** `DATA` **Validasi angka dashboard** — Bandingkan K1 dengan SQL manual setelah alur demo. *Rujukan:* SDD §11. *Tiket:* DA-16 · DA · Kam 12

## M12 — Chatbot FAQ

Problem: P1

- [ ] **M12-01** `DATA` **`faq.md` final** — ≥ 12 bagian `## [faq-<id>] Judul`; tanpa janji waktu layanan. *Rujukan:* AI-PROMPTS §6.1. *Tiket:* PM-03 · PM · Min 8
- [ ] **M12-02** `AI` **Prompt `faq` + fallback kata kunci** — Judul ×3, isi ×1, ambil bagian skor ≥ 2. *Rujukan:* AI-PROMPTS §6.1, §7.5. *Tiket:* BE-20 · BE · Sen 9
- [ ] **M12-03** `API` **C4 `POST /chat/faq`** — Publik, rate limit per IP, `history` ≤ 6. *Rujukan:* API C4. *Tiket:* BE-20 · BE · Sen 9
- [ ] **M12-04** `TEST` **`api/faq.test.js`, `unit/faqFallback.test.js`** — Di luar cakupan, niat melapor, 429. *Rujukan:* PRD M12. *Tiket:* BE-20 · BE · Sen 9
- [ ] **M12-05** `MOB` **Layar Bantuan (M-S18)** — Turunan layar asisten app SmartRoute ke endpoint C4; saran cepat 3 pertanyaan, jawaban + "Sumber: <bagian FAQ>", tombol "Lapor lewat chat" bila `niat_melapor`. *Rujukan:* UI-SPEC S18. *Tiket:* MB-20 · PM · Rab 11 · ♻ *Sebagian dari app SmartRoute:* `src/app/assistant.tsx, src/services/assistantService.ts`

## M13 — Transparansi AI

Problem: etika

- [ ] **M13-01** `WEB` **`AiBadge` & `AiReason` web** — "Saran AI" / "Saran AI (tersimpan)" / "Aturan otomatis"; popover alasan + keyakinan kata + tautan Tentang AI. *Rujukan:* UI-SPEC §0. *Tiket:* FS-04 · FS · Min 8
- [ ] **M13-02** `MOB` **`AiBadge` & `AiReason` mobile** — Arti sama dengan web, warna token `ai` mobile (DESIGN §7.1), ikon `sparkles`, label aksesibilitas. *Rujukan:* DESIGN §7.3. *Tiket:* MB-04 · PM · Min 8 · ♻ *Pola dari app SmartRoute:* `src/components/crowd/crowdLevel.ts (warna & label level)`
- [ ] **M13-03** `WEB` **Tentang AI S15** — Teks PM-03 + status mode dari Z1. *Rujukan:* UI-SPEC S15. *Tiket:* BE-28 · BE · Jum 13
- [ ] **M13-04** `MOB` **Tentang AI M-S15** — Teks sama + status mode. *Rujukan:* UI-SPEC S15. *Tiket:* MB-20 · PM · Rab 11
- [ ] **M13-05** `API` **U4 log AI** — Tanpa `output_json`, filter purpose/provider. *Rujukan:* API U4. *Tiket:* DA-13 · DA · Kam 12
- [ ] **M13-06** `WEB` **Admin S17** — Tab Pengguna, Komunitas, Kanal instansi, Log AI, Laporan ditolak. *Rujukan:* UI-SPEC S17. *Tiket:* BE-27 · BE · Jum 13
- [ ] **M13-07** `TEST` **`unit/allowlist.test.js`, `api/admin.test.js`** — Payload AI tanpa PII; log tanpa isi pribadi. *Rujukan:* PRD M13. *Tiket:* DA-13 · DA · Kam 12
- [ ] **M13-08** `UX` **Jejak koreksi di timeline** — "Label AI: sedang → diubah moderator: tinggi". *Rujukan:* PRD M05-1. *Tiket:* MB-10 · PM · Rab 11

## M14 — Mode demo, seed sintetis, offline & jaringan

Problem: demo

- [ ] **M14-01** `DATA` **Fixtures pengguna/komunitas/wilayah/kanal** — PRD §12.1–12.4; anggota tersedia 6/10/3; sandi `Demo@12345`. *Rujukan:* PRD §12. *Tiket:* DA-01 · DA · Sab 7
- [ ] **M14-02** `DATA` **`seed.js` idempoten** — Hapus data sintetis anak→induk, upsert areas & kategori, hash sandi, waktu relatif. *Rujukan:* SDD §6.9. *Tiket:* DA-02 · DA · Min 8
- [ ] **M14-03** `DATA` **Fixtures laporan, aksi, bukti, hambatan** — L01–L15 (cadangan T−8 hari berjudul "(Cadangan)"), A03–A05, H01–H04, foto tanpa wajah/plat. *Rujukan:* PRD §12.5–12.6. *Tiket:* DA-08 · DA · Sel 10
- [ ] **M14-04** `SVC` **Propagasi `is_synthetic`** — Laporan/hambatan buatan akun sintetis ikut sintetis. *Rujukan:* SDD §6.9 butir 6. *Tiket:* BE-07 · BE · Sen 9
- [ ] **M14-05** `OPS` **`ai:record` & `routes:export/import`** — Rekam AI & rute saat gladi online; impor saat seed dengan `expires_at` diperpanjang. *Rujukan:* SDD §10.3. *Tiket:* BE-21 · BE · Jum 13
- [ ] **M14-06** `WEB` **Worker MapLibre lokal** — `map.tsx` baris 25–29 → `?url` import. *Rujukan:* SDD §10.1. *Tiket:* FS-10 · FS · Sel 10
- [ ] **M14-07** `WEB` **Basemap offline web** — `mapStyle.ts`, protokol pmtiles, `VITE_MAP_STYLE`, rencana B kecamatan.geojson. *Rujukan:* SDD §10.2. *Tiket:* FS-11 · FS · Rab 11
- [ ] **M14-08** `WEB` **`useHealth` + `FallbackBanner` + `.env.offline`** — Banner "Mode cadangan aktif…". *Rujukan:* UI-SPEC §0. *Tiket:* FS-24 · FS · Sen 9
- [ ] **M14-09** `MOB` **`apiConfig.ts` Cloudflare → hotspot** — Perluas `apiConfig.ts` app SmartRoute: health 30 dtk, gagal 2× pindah URL, banner; hapus `@expo/ngrok`. *Rujukan:* SDD §8A.6. *Tiket:* MB-22 · BE · Jum 13 · ♻ *Sebagian dari app SmartRoute:* `src/services/apiConfig.ts`
- [ ] **M14-10** `MOB` **Pengaturan server M-S19** — Status, "Uji koneksi", URL manual, saklar pindah otomatis, mode AI/rute. *Rujukan:* UI-SPEC M-S19. *Tiket:* MB-22 · BE · Jum 13
- [ ] **M14-11** `MOB` **Basemap offline mobile** — Style lokal / PMTiles bila didukung, rencana B latar polos. *Rujukan:* SDD §8A.5. *Tiket:* MB-21 · FS · Jum 13
- [ ] **M14-12** `TEST` **Gladi offline penuh** — Wi-Fi & data seluler mati: web + 3 HP via hotspot menjalankan DEMO-SCRIPT. *Rujukan:* PRD M14-3. *Tiket:* PM-13 · PM · Jum 13
- [ ] **M14-13** `TEST` **Uji mobile menyeluruh** — GWT inti di 2 HP Android (+ iPhone bila ada) lewat Cloudflare & hotspot. *Rujukan:* TICKETS MB-24. *Tiket:* MB-24 · BE · Sab 14
- [ ] **M14-14** `OPS` **Build APK rilis & iOS** — APK rilis; iOS dev build bila PRE-15 menyatakan bisa; catat di README. *Rujukan:* SDD §8A.7. *Tiket:* MB-23 · FS · Sab 14 · ♻ *Sebagian dari app SmartRoute:* `eas.json`

## M15 — Rekomendasi moda untuk umum (mesin rute SmartRoute)

Problem: P5

- [ ] **M15-01** `OPS` **Subtree layanan SmartRoute ke `mobility/`** — `git subtree split --prefix=backend` di smartroute-app lalu `git subtree add --prefix=mobility`; hanya `backend-skeleton` & `otp2-setup` yang dipakai. *Rujukan:* SDD §4.2, D21. *Tiket:* PRE-18 · FS · PRE · ♻ *Sebagian dari app SmartRoute:* `smartroute-app/backend/backend-skeleton, otp2-setup`
- [ ] **M15-02** `OPS` **Bangun graph OTP2 & jalankan layanan** — `otp2-setup`: clip-osm, build-graph (graph ± 205 MB, tidak di git), `docker compose up`; `backend-skeleton` `npm run dev`; catat RAM/disk laptop demo & cadangan. *Rujukan:* SDD §4.2, PRD R20. *Tiket:* PRE-18 · FS · PRE · ♻ *Sebagian dari app SmartRoute:* `smartroute-app/backend/otp2-setup/scripts/*`
- [ ] **M15-03** `API` **V1–V3 proxy `/api/mobility/*`** — `routes/mobility.routes.js`: requireAuth, rate limit 30/menit, teruskan ke `MOBILITY_URL` (timeout 15 dtk), envelope SUSI, 503 `MOBILITY_UNAVAILABLE`. *Rujukan:* API §13A. *Tiket:* MV-01 · BE · Min 8
- [ ] **M15-04** `TEST` **`api/mobility.test.js`** — Layanan di-mock: sukses V1–V3, 401 tanpa token, 503 saat layanan mati, 400 diteruskan. *Rujukan:* PRD M15-4/5. *Tiket:* MV-01 · BE · Min 8
- [ ] **M15-05** `MOB` **Arahkan layar rute ke proxy SUSI** — `routeService`/`stationSearchService`/`nearbyStopsService` memakai `apiClient` (`/api/mobility/*`) dan token SUSI. *Rujukan:* SDD §8A.3. *Tiket:* MV-04 · FS · Kam 12 · ♻ *Sebagian dari app SmartRoute:* `src/services/routeService.ts, stationSearchService.ts, nearbyStopsService.ts`
- [ ] **M15-06** `MOB` **Tab "Rute" (M-S20/M-S21)** — Pertahankan layar cari rute, hasil Terbaik/Termurah/Tercepat/Ternyaman, detail & navigasi; masuk tab Rute warga & relawan. *Rujukan:* UI-SPEC M-S20/M-S21. *Tiket:* MV-04 · FS · Kam 12 · ♻ *Sebagian dari app SmartRoute:* `src/app/(tabs)/index.tsx, src/app/(tabs)/route/*, src/app/navigate.tsx`
- [ ] **M15-07** `MOB` **Pencarian lokasi offline** — Bila Nominatim gagal/offline → saran dari V2 (halte/stasiun). *Rujukan:* PRD M15-3. *Tiket:* MV-04 · FS · Kam 12 · ♻ *Sebagian dari app SmartRoute:* `src/utils/geocode.ts, src/hooks/useStopSearch.ts`
- [ ] **M15-08** `MOB` **Tombol dari detail aksi** — "Rute angkutan umum ke lokasi" membuka M-S20 dengan tujuan = lokasi aksi. *Rujukan:* PRD M15-6. *Tiket:* MV-04 · FS · Kam 12
- [ ] **M15-09** `UX` **Teks & label rute SUSI** — `ComparisonCard`, `RouteCard`, `RouteDetailCard`, `PreferenceCard`: label Indonesia SUSI, "perkiraan" + sumber jadwal/tarif, tanpa nama SmartRoute. *Rujukan:* UI-SPEC M-S21. *Tiket:* MV-02 · DA · Min 8 · ♻ *Sebagian dari app SmartRoute:* `src/components/ComparisonCard.tsx, RouteCard.tsx, RouteDetailCard.tsx, PreferenceCard.tsx`
- [ ] **M15-10** `TEST` **Regresi rute** — 10 pasangan titik DKI lewat proxy, hasil apa adanya di `docs/notes/mobility-regresi.md`. *Rujukan:* TICKETS MV-03. *Tiket:* MV-03 · DA · Sen 9 · ♻ *Sebagian dari app SmartRoute:* `smartroute-app/backend/backend-skeleton/scripts/regression-routes.mjs`

## M16 — Panel admin di aplikasi mobile

Problem: admin

- [ ] **M16-01** `MOB` **Tab admin & navigasi** — Tab Pengguna · Komunitas · Log AI · Lainnya (Kanal instansi, Laporan ditolak); hanya `role=admin`. *Rujukan:* UI-SPEC M0, M-S22. *Tiket:* MB-28 · PM · Min 8
- [ ] **M16-02** `MOB` **Pengguna & Log AI** — U1–U3 daftar + form layar penuh (validasi sama dengan S17), U4 log tanpa PII. *Rujukan:* UI-SPEC M-S22. *Tiket:* MB-28 · PM · Min 8
- [ ] **M16-03** `MOB` **Komunitas, kanal instansi, laporan ditolak** — G1–G6, H1–H3, R9 "Buka ulang" + alasan 5–300. *Rujukan:* UI-SPEC M-S22. *Tiket:* MB-29 · DA · Jum 13
- [ ] **M16-04** `TEST` **Uji manual admin mobile** — GWT M16-1…5 di HP. *Rujukan:* PRD M16. *Tiket:* MB-29 · DA · Jum 13

## M17 — Notifikasi push + cadangan in-app

Problem: P1

- [ ] **M17-01** `OPS` **Firebase & kredensial FCM di EAS** — Proyek Firebase, FCM V1 di `eas credentials`; catat syarat iOS (akun Apple). *Rujukan:* SDD D22. *Tiket:* PRE-19 · FS · PRE
- [ ] **M17-02** `DB` **Migrasi 006** — `push_tokens`, `notifications.push_status/pushed_at` (sudah diuji di PostgreSQL 18). *Rujukan:* db/migrations/006_push.sql. *Tiket:* BE-29 · BE · Rab 11
- [ ] **M17-03** `API` **N4 & N5 token push** — Upsert token milik sendiri; nonaktifkan saat keluar; token orang lain → 404. *Rujukan:* API N4–N5. *Tiket:* BE-29 · BE · Rab 11
- [ ] **M17-04** `SVC` **`push.service.sendForNotifications`** — Setelah commit `notification.enqueue`, `setImmediate`; Expo Push API 5 dtk; status terkirim/gagal/tidak_dikirim; DeviceNotRegistered → token nonaktif. *Rujukan:* SDD §6.10. *Tiket:* BE-29 · BE · Rab 11
- [ ] **M17-05** `TEST` **`api/push.test.js`** — Expo di-mock: terkirim, DeviceNotRegistered, offline → tidak_dikirim; in-app tetap ada. *Rujukan:* PRD M17. *Tiket:* BE-29 · BE · Rab 11
- [ ] **M17-06** `MOB` **`expo-notifications`** — Izin dengan teks UI-SPEC, `getExpoPushTokenAsync` → N4 setelah login, N5 saat keluar, ketuk → buka `link`. *Rujukan:* UI-SPEC M (izin push). *Tiket:* MB-30 · FS · Sel 10

## S01 — Hambatan dari warga + konfirmasi (Should)

Problem: P5

- [ ] **S01-01** `API` **O2 untuk warga → menunggu_konfirmasi, O3 konfirmasi** — 2 ya → aktif, 2 tidak → dicabut; pembuat → SELF_VERIFICATION; dobel → ALREADY_EXISTS. *Rujukan:* API O2–O3. *Tiket:* DA-09 · DA · Sel 10
- [ ] **S01-02** `MOB` **Konfirmasi di M-S02 & M-S13** — "Masih ada?" → "Ya, masih" / "Sudah tidak ada"; "+ Usulkan hambatan". *Rujukan:* UI-SPEC S13, M. *Tiket:* MB-17 · DA · Kam 12

## S02 — Perbandingan moda ke lokasi aksi (Should)

Problem: P5

- [ ] **S02-01** `API` **P2 `GET /routes/compare`** — Tiga profil paralel berbagi cache; biaya kendaraan null [PERLU DATA]. *Rujukan:* API P2. *Tiket:* BE-24 · BE · Jum 13
- [ ] **S02-02** `MOB` **Tabel bandingkan moda di tab Rute** — Tiga baris jalan kaki/sepeda/motor-mobil dari P2, biaya kendaraan "—" sampai rumus ada [PERLU DATA], kalimat asumsi. *Rujukan:* UI-SPEC S11. *Tiket:* MB-27 · PM · Sab 14

## S03 — Deteksi duplikat (Should)

Problem: P1

- [ ] **S03-01** `API` **R10 + `duplicate_candidates` di R2** — Kategori sama, ≤ 100 m, ≤ 7 hari, bukan ditolak. *Rujukan:* API R10. *Tiket:* BE-23 · BE · Sel 10
- [ ] **S03-02** `WEB` **Daftar duplikat di moderasi web & mobile** — "Kemungkinan duplikat (n)" + "#39 · 42 m" + "Tandai duplikat dari #…" (R7 dengan `duplicate_of`) di S06 web & M-S06. *Rujukan:* UI-SPEC S06. *Tiket:* FS-35 · FS · Jum 13

## S04 — Cek kesesuaian foto (Should)

Problem: anti-palsu

- [ ] **S04-01** `AI` **`photo_check` di job triase** — Hanya bila `PHOTO_CHECK_ENABLED`; teks pemberitahuan di form. *Rujukan:* AI-PROMPTS §6.2. *Tiket:* BE-25 · DA · Sel 10

## S05 — Samarkan wajah/plat manual (Should)

Problem: privasi

- [ ] **S05-01** `MOB` **Kotak blur di PhotoPicker** — "Samarkan wajah/plat" → tarik kotak → "Terapkan"; hanya versi terblur yang diunggah, `is_blurred=true`; kotak bisa digeser keyboard. *Rujukan:* UI-SPEC S03-B, PRD S05. *Tiket:* MB-26 · PM · Sel 10

## S06 — Notifikasi in-app (Should, dijadwalkan)

Problem: P1

- [ ] **S06-01** `SVC` **`notification.service` + pemicu** — Tabel pemicu SDD §6.8; ditulis dalam transaksi pemanggil; stub `enqueue` sejak BE-09. *Rujukan:* SDD §6.8. *Tiket:* DA-12 · DA · Rab 11
- [ ] **S06-02** `API` **N1–N3** — `link` dihitung server; `meta.unread`. *Rujukan:* API N1–N3. *Tiket:* DA-12 · DA · Rab 11
- [ ] **S06-03** `TEST` **`api/notifications.test.js`** — 404 notifikasi orang lain; read-all. *Rujukan:* PRD S06. *Tiket:* DA-12 · DA · Rab 11
- [ ] **S06-04** `MOB` **Lonceng + layar Notifikasi M-S16** — Polling 60 dtk; titik biru belum dibaca; "Tandai semua dibaca". *Rujukan:* UI-SPEC S16. *Tiket:* MB-20 · PM · Rab 11

## X — Lintas fitur: tema, komponen, aksesibilitas, demo & submission

Problem: —

- [ ] **X-01** `WEB` **Token semantik + tema ikut sistem** — Blok `@theme` DESIGN §8.1 (`surface`, `surface-2`, `ink`, `ink-2`, warna makna gelap/terang); skrip `.dark` otomatis di `index.html` sebelum aplikasi dimuat. *Rujukan:* DESIGN §8.1. *Tiket:* FS-34 · FS · Min 8
- [ ] **X-02** `WEB` **Ganti kelas lama ke token semantik** — Jalankan perintah DESIGN §2.4 di `web/src`, tinjau diff; mode gelap harus tampak sama persis dengan repo lama (bandingkan tangkapan layar). *Rujukan:* DESIGN §2.4. *Tiket:* FS-34 · FS · Min 8
- [ ] **X-03** `WEB` **Peta ikut tema** — Hapus pemaksaan `theme="dark"`; mapcn memilih Carto dark-matter/positron dari kelas `.dark`; offline `namedFlavor` dark/light. *Rujukan:* DESIGN §8.2. *Tiket:* FS-34 · FS · Min 8
- [ ] **X-04** `MOB` **Palet mobile app SmartRoute** — `userInterfaceStyle: "light"`, StatusBar light di latar biru malam, token DESIGN §7.1 (+ token `ai`). *Rujukan:* DESIGN §7.1, §8.3. *Tiket:* MB-04 · PM · Min 8 · ♻ *Sebagian dari app SmartRoute:* `tailwind.config.js, src/app/_layout.tsx`
- [ ] **X-05** `UX` **Uji kontras dua tema** — Pasangan DESIGN §9 di gelap & terang; bila gagal ubah nilai di DESIGN §2 dan `index.css`. *Rujukan:* DESIGN §9. *Tiket:* PM-07 · PM · Sel 10
- [ ] **X-06** `UX` **Checklist review desain di template PR** — Salin DESIGN §10 ke `.github/pull_request_template.md`. *Rujukan:* DESIGN §10. *Tiket:* PM-04 · PM · Min 8
- [ ] **X-07** `WEB` **Komponen dasar web** — Badge, dialog/modal, toast, EmptyState, ErrorState, skeleton, banner — resep persis DESIGN §6. *Rujukan:* DESIGN §6. *Tiket:* FS-04 · FS · Min 8
- [ ] **X-08** `WEB` **`BaseMap` & `ReportMarker` web** — Map3DToggle diparametrisasi (bounds env, 3D hanya online, theme dark); marker berdenyut warna urgensi bentuk status. *Rujukan:* SDD §8.6. *Tiket:* FS-06 · FS · Sen 9
- [ ] **X-09** `MOB` **Komponen dasar mobile** — Pakai ulang Text/Header/TopNav/InfoCard/modal BlurView; tambah Badge, AiBadge, Empty/Error/Toast/FallbackBanner — resep DESIGN §7.3; `accessibilityLabel` semua tombol. *Rujukan:* DESIGN §7.3. *Tiket:* MB-04 · PM · Min 8 · ♻ *Sebagian dari app SmartRoute:* `src/components/Text.tsx, Header.tsx, TopNav.tsx, InfoCard.tsx, crowd/CrowdReportModal.tsx`
- [ ] **X-10** `UX` **Audit aksesibilitas web** — axe + keyboard S01, S02, S06; kontras AA; status ikon + teks. *Rujukan:* PRD §15. *Tiket:* PM-07 · PM · Sel 10
- [ ] **X-11** `UX` **Review teks mobile vs UI-SPEC** — Semua string mobile cocok dengan UI-SPEC & `shared/labels.ts`. *Rujukan:* UI-SPEC. *Tiket:* PM-08 · PM · Sel 10
- [ ] **X-12** `UX` **`prefers-reduced-motion` / pengurangan gerak** — Matikan denyut marker & animasi masuk. *Rujukan:* SDD §8.6. *Tiket:* FS-06 · FS · Sen 9
- [ ] **X-13** `UX` **Format angka & tanggal Indonesia** — "7 Nov 2026, 09.12", "1,8 km", "± 7 menit", koma desimal — util di `shared/`. *Rujukan:* UI-SPEC §0. *Tiket:* FS-02 · FS · Sab 7
- [ ] **X-14** `DATA` **Eval AI 40 kasus** — `npm run eval:ai` live & fallback; hasil apa adanya di README. *Rujukan:* AI-PROMPTS §9. *Tiket:* DA-14 · DA · Jum 13
- [ ] **X-15** `OPS` **README root** — Jalan lokal web/backend/mobile, asal kode, hasil eval, status iOS. *Rujukan:* SDD §11. *Tiket:* PM-12 · PM · Kam 12
- [ ] **X-16** `UX` **Slide presentasi** — Masalah dari data validasi, etika, roadmap. *Rujukan:* DEMO-SCRIPT §1. *Tiket:* PM-06 · PM · Sen 9
- [ ] **X-17** `TEST` **Gladi demo 1 online** — DEMO-SCRIPT dengan 3 HP + laptop, catat waktu & bug. *Rujukan:* DEMO-SCRIPT. *Tiket:* PM-11 · PM · Kam 12
- [ ] **X-18** `OPS` **Video 3–5 menit** — 5 fitur AI terlihat, aplikasi HP sebagai produk utama, tanpa narasi. *Rujukan:* DEMO-SCRIPT §2. *Tiket:* PM-14 · PM · Jum 13
- [ ] **X-19** `OPS` **Rilis & tag `v1.0.0`** — Uji clone bersih, CI hijau, tag ≥ 3 jam sebelum batas. *Rujukan:* SDD §12. *Tiket:* FS-28 · FS · Sab 14
- [ ] **X-20** `OPS` **Submission** — Tautan repo + tag + video (+ APK bila diminta). *Rujukan:* PRD §21. *Tiket:* PM-16 · PM · Sab 14
- [ ] **X-21** `DATA` **Cek label sintetis** — Banner, nama "(sintetis)", slide tidak menyebut angka seed sebagai dampak nyata. *Rujukan:* PRD R14. *Tiket:* DA-20 · DA · Sab 14

## Cakupan tiket

Setiap tiket kode di TICKETS.md muncul minimal sekali di atas, kecuali tiket non-kode/pendukung berikut (riset, desain, wawancara, gladi, bug buffer, Should API) yang langkahnya sudah tertulis di TICKETS.md: PRE-03, PRE-04, PRE-05, PRE-06, PRE-07, PRE-08, PRE-09, PRE-10, PRE-11, PRE-12, PRE-13, PRE-14, PM-01, PM-02, PM-05, PM-09, DA-19, PM-15, FS-29, BE-22, PRE-17.
