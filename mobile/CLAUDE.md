@AGENTS.md

# CLAUDE.md — mobile/

Aplikasi utama SUSI Connect untuk semua peran (warga, relawan, koordinator, moderator, instansi, admin). Dibuat dari app SmartRoute (`lippbyte/smartroute-app` folder `smartroute/`) lewat git subtree.

Stack (dari app SmartRoute, sudah terbukti di EAS): Expo SDK ~57, React Native 0.86.3, React 19.2, expo-router (`src/app/`), NativeWind 4.2.6 + **Tailwind 3.4** (bukan v4 seperti web), `@maplibre/maplibre-react-native` 11.3.8, `@expo/vector-icons`, expo-location, expo-dev-client. Baca dokumentasi Expo **v57** sebelum menulis kode (lihat `AGENTS.md`).

## Kondisi saat ini

Isi masih app SmartRoute. **MB-01** mengganti identitas (`app.json` name/slug/scheme/package/owner/projectId, ikon, splash) dan memangkas fitur kepadatan, ngrok, `react-native-maps`. **Layar rute/navigasi/halte dipertahankan** untuk M15 (rekomendasi moda untuk umum). Daftar lengkap: `docs/AUDIT-SMARTROUTE-APP.md` §4.

## Pakai ulang dulu

Sebelum menulis komponen/servis baru, cek penanda **♻ Sebagian/Pola** di `docs/TASKS.md` dan buka file asalnya: `Text.tsx` (font), `Header.tsx`, `TopNav.tsx`, `InfoCard.tsx`, `CustomTabBar.tsx`, modal + `BlurView` (`CrowdReportModal.tsx`), `assistant.tsx` (dasar chat-lapor & Bantuan), peta MapLibre (`CrowdMapView.native.tsx`, `AllStopsMapView.native.tsx`, `NavigateMap.native.tsx`), `utils/currentLocation.ts`, `utils/withTimeout.ts`, `services/apiConfig.ts`.

## Aturan

- **Tampilan = gaya app SmartRoute** (DESIGN §7): latar biru malam `#001C43`, kartu terang, `brand-blue` / `brand-green`, satu palet (tanpa mode gelap). Pakai token Tailwind, bukan hex lepas (`bg-[#018959]` → `bg-brand-green`). Teks lewat komponen `Text` (Plus Jakarta Sans).
- **Peta hanya MapLibre RN v11**: `Map`, `Camera`, `Marker`, `GeoJSONSource` + layer. Jangan pakai nama API v10 (`MapView`, `ShapeSource`, `PointAnnotation`) dan jangan menambah `react-native-maps`.
- **Bukan Expo Go**: perlu development build (`eas build --profile development`); MapLibre tidak jalan di Expo Go.
- Klien API `src/services/apiClient.ts` di atas `fetchWithTimeout`; base URL dari `apiConfig.ts` dengan `EXPO_PUBLIC_API_BASE_URL` (tanpa `/api`) + `EXPO_PUBLIC_API_FALLBACK_URL` (IP hotspot). Token di `expo-secure-store`, bukan AsyncStorage. Foto dimuat dengan header `Authorization`, bukan `?token=`.
- Rute angkutan umum lewat `/api/mobility/*` backend SUSI, bukan langsung ke layanan `mobility/`.
- Teks UI & izin perangkat persis UI-SPEC bagian M; label dari `shared/labels.ts`. Target sentuh ≥ 44 pt, `accessibilityLabel` di setiap tombol ikon.
- Harus tetap jalan lewat hotspot laptop tanpa internet (SDD §8A.6): Nominatim boleh dipakai bila online, dengan cadangan pencarian halte (`/mobility/stops/search`).

## Perintah

`npx expo start` (setelah dev build terpasang) · `npm run lint` · `npx tsc --noEmit` · build: `eas build -p android --profile development|preview`.
