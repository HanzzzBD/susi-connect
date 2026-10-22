# Audit repo smartroute-app terhadap task SUSI Connect

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.0 · **Repo diaudit:** `https://github.com/lippbyte/smartroute-app` (commit `0a92f40`, dibaca saja, tidak dijalankan)
**Dibandingkan dengan:** TICKETS.md v2.3, TASKS.md v1.3 (sudah diselaraskan dengan audit ini)

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Audit pertama. Keputusan tim setelah audit: mobile SUSI **mengikuti desain app SmartRoute**, `mobile/` dibuat dari `smartroute/` lewat **git subtree lalu dipangkas**, izin panitia **mencakup seluruh repo smartroute-app**. |

---

## 1. Kesimpulan

- **smartroute-app adalah proyek SmartRoute AI** (perencana perjalanan transportasi umum Jabodetabek), bukan SUSI Connect. Tidak ada satu pun fitur domain SUSI (laporan warga, triase, moderasi, matching komunitas, aksi, bukti, rujukan, hambatan, dampak) di dalamnya.
- Yang **sudah ada dan bisa dipakai** adalah **infrastruktur aplikasi mobile**: Expo SDK 57 + expo-router, MapLibre React Native 11.3.8 dengan development build, NativeWind, EAS Build, GPS, layar chat asisten AI, modal/bottom sheet, tab bar, fetch dengan timeout. Ini memangkas sebagian besar risiko spike mobile (PRE-15).
- `smartroute-dashboard/` dan `smartroute-backend/` di repo ini **sama** dengan yang sudah ada di `web/` dan `backend/` monorepo SUSI. Satu-satunya perbedaan: `.gitignore` dashboard sudah memuat `.env` (temuan T10 sudah beres di sana).
- `backend/backend-skeleton/` (Express 5 + **TypeScript**, OpenRouter) tidak dipakai: SUSI memakai JavaScript CommonJS + Express 4 + `pg` + Gemini (SDD D3, D9). Hanya polanya yang ditiru (zod, batas waktu, rate limit AI).
- Dampak ke jadwal: **−7 jam** minggu kerja dan **−3 jam** sebelum 7 Nov (TICKETS v2.2). Beban tim turun dari 286 j menjadi **279 j** dari kapasitas 280 j.

## 2. Isi repo

| Folder | Isi | Status untuk SUSI |
| --- | --- | --- |
| `smartroute/` | Aplikasi mobile Expo SmartRoute (cari rute, navigasi, peta kepadatan, halte terdekat, asisten AI) — 79 file `src/`, ± 9 rb baris | **Dipakai** sebagai basis `mobile/` (subtree + pangkas) |
| `smartroute-dashboard/` | Dashboard web operator | Sudah ada di `web/` (identik) |
| `smartroute-backend/` | API dashboard (Express + PostgreSQL) | Sudah ada di `backend/` (identik) |
| `backend/backend-skeleton/` | API utama SmartRoute (TS, Express 5, OTP, OpenRouter) | Tidak dipakai; pola ditiru |
| `backend/otp2-*` | Mesin routing OpenTripPlanner + GTFS TransJakarta/KRL/MRT/LRT | Tidak dipakai (SUSI memakai OpenRouteService) |
| `testing-1/` | YOLO11 penghitung orang | Tidak dipakai |
| `task/`, `backend/task/` | Dokumen task SmartRoute | Referensi saja |
| `docs/` | Mockup Figma, arsitektur | `Smartroute_mockup.png` = acuan visual mobile |
| `data/`, `Data KRL JABODETABEK/` | Data jadwal & tarif | Tidak dipakai |

## 3. Status per tiket

Status: **Sudah** = tinggal disesuaikan nama/konfigurasi · **Sebagian** = pola/kode ada, perlu diubah ke domain SUSI · **Belum** = ditulis baru · **—** = tidak terkait.

### 3.1 Mobile

| Tiket | Isi tiket | Status | Bukti di smartroute-app | Sisa pekerjaan | Jam lama → baru |
| --- | --- | --- | --- | --- | --- |
| PRE-15 | Spike Expo + MapLibre RN | **Sudah** | `smartroute/package.json`: `expo ~57.0.16`, `@maplibre/maplibre-react-native ^11.3.8`, `expo-dev-client`; `app.json` plugin MapLibre; `CrowdMapView.native.tsx`, `AllStopsMapView.native.tsx`, `NavigateMap.native.tsx` memakai `Map`, `Camera`, `Marker`, `GeoJSONSource` (v11); `task/Task_App_04_EAS_Build_Verification.md` (APK lewat EAS cloud) | Uji ulang build di laptop tim; cek **iOS** (belum ada bukti build iOS) dan dukungan PMTiles | 4 → 1 |
| MB-01 | Init proyek Expo | **Sudah** → diganti "subtree + pangkas" | expo-router (`src/app`), TS, NativeWind 4.2.6 + Tailwind 3.4, `metro.config.js`, `babel.config.js`, font Plus Jakarta Sans | `git subtree add` ke `mobile/`; ganti `name/slug/scheme/package/owner/projectId`; hapus fitur transit (§4) | 1 → 3 |
| MB-02 | `shared/` + apiClient | **Sebagian** | `services/apiConfig.ts` (satu URL `EXPO_PUBLIC_API_BASE_URL`), `utils/withTimeout.ts` (`fetchWithTimeout`, `RequestTimeoutError`) | `shared/` alias Metro; token SecureStore; envelope SUSI; dua URL (Cloudflare + hotspot) | 2 → 2 |
| MB-03 | Development build Android | **Sudah** | `eas.json` profil `development` (devClient, internal) & `preview`; `app.json` `expo-build-properties` `usesCleartextTraffic: true` | Build ulang dengan package baru; pasang di 3 HP | 3 → 1 |
| MB-04 | Komponen dasar mobile | **Sebagian** | `components/Text.tsx` (font), `Header.tsx`, `TopNav.tsx`, `InfoCard.tsx`, modal + `BlurView` (`CrowdReportModal.tsx`, `PreferenceCard.tsx`), pegangan sheet `w-10 h-1 rounded-full bg-line` | Badge status/urgensi, AiBadge/AiReason, Empty/Error/Toast/FallbackBanner bergaya app | 4 → 3 |
| MB-05 | Login & navigasi | **Sebagian** | `components/CustomTabBar.tsx` (tab bar `rounded-t-3xl`, ikon Ionicons, aktif `#0F3FC1`); tab `(tabs)/index, route, account` | Tab per persona (UI-SPEC M0), login + akun demo, AuthContext — tidak ada autentikasi di app lama | 3 → 3 |
| MB-06 | MapView mobile | **Sebagian** | Marker kustom & kamera fit-bounds (`CrowdMapView.native.tsx`), clustering GPU `GeoJSONSource` (`AllStopsMapView.native.tsx`), garis rute `GeoJSONSource` + layer garis (`NavigateMap.native.tsx`), style OpenFreeMap dark | Marker laporan (warna urgensi/bentuk status), poligon hambatan (layer fill), batas DKI | 4 → 3 |
| MB-07 | Peta & beranda M-S02 | **Sebagian** | Layar peta + kartu info + legenda (`app/crowd-map.tsx`) | Isi data SUSI, bottom sheet ringkasan, tombol "+ Lapor" | 3 → 3 |
| MB-08 | Lapor formulir | **Sebagian** | GPS sekali baca + izin (`utils/currentLocation.ts`), alur modal 2 langkah (`CrowdReportModal.tsx`) | Kamera/galeri (`expo-image-picker` belum terpasang), kompres, multipart, PointPicker | 4 → 4 |
| MB-09 | Lapor lewat chat | **Sebagian** | Layar chat asisten (`app/assistant.tsx`, 563 baris), riwayat giliran (`services/assistantService.ts`), render jawaban (`AssistantAnswerText.tsx`) | DraftCard, konfirmasi, kotak darurat, endpoint C1–C3 | 4 → 3 |
| MB-10 | Laporan saya & detail | **Sebagian** | Kartu riwayat (`HistoryCard.tsx`, `app/(tabs)/history.tsx`) | Data SUSI, timeline, label AI, konfirmasi bukti | 4 → 4 |
| MB-11 | Moderasi mobile | **Belum** | — | Semua | 4 → 4 |
| MB-12 | Rekomendasi | **Belum** | (pola kartu skor `RouteCard.tsx` "8.7/10") | Semua | 3 → 3 |
| MB-13 | Buat aksi | **Belum** | — | Semua | 4 → 4 |
| MB-14 | Aksi saya & detail | **Belum** | — | Semua | 4 → 4 |
| MB-15 | Rute & hambatan di aksi | **Sebagian** | Garis rute di peta (`NavigateMap.native.tsx`), panel navigasi (`NavPanel.tsx`) | Panggil P1, pilih asal/tujuan/moda, hambatan dihindari | 4 → 4 |
| MB-16 | Bukti mobile | **Belum** | — | Kamera before/after, ajukan, verifikasi | 3 → 3 |
| MB-17 | Hambatan mobile | **Belum** | — | Semua | 3 → 3 |
| MB-18 | Rujukan mobile | **Belum** | — | Semua | 3 → 3 |
| MB-19 | Dampak mobile | **Belum** | — | Semua | 2 → 2 |
| MB-20 | Notifikasi, chatbot, Tentang AI | **Sebagian** | Chatbot = layar asisten yang sama dengan MB-09 | Ganti endpoint ke C4, notifikasi, Tentang AI | 3 → 2 |
| MB-21 | Basemap offline mobile | **Belum** | Style masih online (OpenFreeMap) | Style lokal / rencana B | 2 → 2 |
| MB-22 | Pengaturan server & fallback jaringan | **Sebagian** | Dev memakai **ngrok** (`eas.json` env, `@expo/ngrok`), bukan Cloudflare; satu URL | Dua URL + health check + layar Pengaturan | 2 → 2 |
| MB-23 | Build APK rilis & iOS | **Sebagian** | `eas.json` profil `preview` (internal) & `production`; EAS project `lippbytes-team` | Profil rilis untuk SUSI; iOS | 2 → 1 |
| MB-24 | Uji mobile menyeluruh | **Belum** | — | Semua | 2 → 2 |
| MB-25 | Tema mobile ikut sistem | **Dibatalkan** | App SmartRoute memakai satu palet (desain Figma); keputusan baru: mobile ikut desain app | — | 2 → 0 |

### 3.2 Web, backend, data, AI

| Area | Tiket | Status | Catatan |
| --- | --- | --- | --- |
| Web dashboard | FS-01 … FS-34 | **Belum** (basis sudah ada di `web/`) | Kode di smartroute-app identik dengan `web/`; tidak ada pekerjaan SUSI tambahan |
| Backend SUSI | BE-01 … BE-28, DA-02 … DA-16 | **Belum** | `backend-skeleton` beda stack (TS, Express 5, tanpa DB). Pola yang bisa ditiru: validasi zod (`src/lib/validation.ts`), `openRouterRateLimit.ts` (rate limit AI), batas waktu panggilan AI 15 dtk (`services/assistant.ts`) |
| AI | BE-08, BE-20, DA-04 | **Belum** | SmartRoute memakai **OpenRouter**, SUSI memakai **Gemini** (keputusan PRD §1 no. 3). Prompt & skema SUSI ditulis baru (AI-PROMPTS.md) |
| Data & seed | DA-01, DA-02, DA-08 | **Belum** | Data GTFS/tarif tidak relevan |
| Migrasi DB | — | **Sudah** di monorepo SUSI | `db/migrations/001–005` (bukan dari smartroute-app) |
| Validasi masalah, wireframe, slide | PRE-06 … PRE-13, PM-* | **Belum** | `docs/Smartroute_mockup.png` menjadi acuan visual wireframe mobile (PRE-17) |

## 4. Yang harus dipangkas atau diganti dari `smartroute/`

| Bagian | Tindakan | Alasan |
| --- | --- | --- |
| `app.json`: `name`, `slug`, `scheme`, `android.package` (`com.inouerakan.smartroute`), `owner` (`lippbytes-team`), `extra.eas.projectId` | Ganti ke SUSI (`susi-connect`, `id.susiconnect.app` [ASUMSI]) dan buat proyek EAS baru | Identitas aplikasi berbeda |
| Ikon, splash (`assets/splash`, `assets/images`), `SplashIntro.tsx`, `ScreenBackground.tsx` (gambar Monas) | Ganti aset SUSI; latar layar memakai warna biru malam yang sama tanpa gambar Monas [ASUMSI] | Branding |
| Teks izin lokasi "Izinkan SmartRoute …" | Ganti dengan teks UI-SPEC M (lokasi, kamera, galeri) | Teks SUSI |
| Layar & komponen transit: `(tabs)/route/*`, `navigate.tsx`, `nearby-stops.tsx`, `all-stops-map.tsx`, `components/transit/*`, `components/navigate/*` (setelah pola peta disalin ke komponen SUSI), `ComparisonCard`, `PreferenceCard`, `DepartureTimeField`, `RealTimeInfoCard`, `RouteCard`, `RouteDetailCard`, `QuickLocation*`, `LocationAutocompleteField`, `data/mockRoutes.ts`, `services/routeService.ts`, `routeStore.ts`, `nearbyStopsService.ts`, `stationSearchService.ts`, `crowdService.ts`, `utils/currency.ts`, `departureTime.ts`, `navInstructions.ts`, `navProgress.ts`, `quickLocations.ts`, `stopActions.ts`, `hooks/useStopSearch.ts`, `useLocationSuggestions.ts` | Hapus | Domain transportasi |
| `utils/geocode.ts` (Nominatim online) | Hapus; SUSI memakai daftar `areas` (Z3) | Butuh internet; tidak cocok offline |
| `react-native-maps` | Hapus dari dependensi bila tidak ada lagi pemakai | SUSI hanya MapLibre (SDD D19) |
| `@expo/ngrok`, URL ngrok di `eas.json` | Ganti dengan Cloudflare + hotspot (SDD §8A.6) | Keputusan jaringan |
| `constants/developerInfo.ts`, `components/account/DeveloperInfoSheet.tsx` | Ganti isi tim SUSI atau hapus | Konten SmartRoute |
| `tsconfig.json` | Pertahankan (tanpa `baseUrl`, aman di TypeScript 6 — dicek) | — |
| **Dipertahankan** | `Text.tsx`, `Header.tsx`, `TopNav.tsx`, `CustomTabBar.tsx`, `InfoCard.tsx`, pola modal + BlurView, `assistant.tsx` + `AssistantAnswerText.tsx` (diubah ke C2/C4), `currentLocation.ts`, `withTimeout.ts`, `apiConfig.ts` (diubah), komponen peta MapLibre (diubah), `tailwind.config.js` (token desain), font | Infrastruktur & desain |

## 5. Risiko baru dari audit

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Desain mobile (terang, biru) berbeda dari web (gelap monokrom) | Juri melihat dua gaya | Disengaja: web = alat operator, mobile = aplikasi warga; logo & ikon status disamakan (DESIGN v1.1) |
| Belum ada bukti build iOS | iOS tidak bisa didemokan | Sudah tercatat R15; uji di PRE-15 |
| `AGENTS.md`/`CLAUDE.md` di `smartroute/` | Isinya hanya pengingat membaca dokumentasi Expo v57 (dicek) | Pertahankan |
