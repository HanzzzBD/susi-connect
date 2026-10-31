# CLAUDE.md — web/

Web pendamping untuk operator. **Hanya** layar S01 (masuk), S02 (peta publik), S06 (moderasi), S07 (verifikasi bukti), S14 (dampak/dashboard), S15 (Tentang AI), S17 (admin). Layar warga, relawan, dan koordinator ada di `mobile/` — jangan dibuat di web (SDD D18).

Stack: React 19, TypeScript, Vite, Tailwind v4, shadcn (`components.json` style `base-nova`), mapcn (`src/components/ui/map.tsx`, MapLibre GL 6.6), `react-icons/ri`, `motion`.

## Tampilan: pertahankan smartroute-dashboard

- Halaman & komponen lama **diadaptasi, bukan dibuang** (SDD §2.3): `pages/Map.tsx` → `MapWorkspace` (prop `mode`), `pages/Dashboard.tsx` → `DashboardPage`, `Leaderboard` → `QueuePanel`, `FlaggedStationsPanel` → `ObstaclePanel`, `StationDetail` → `ReportDetailModal`, `ViewToggle` → navigasi persona, `KpiCard` dipakai ulang.
- Resep kelas **persis** DESIGN §6. Setelah FS-34 hanya token semantik (`surface`, `surface-2`, `ink`, `ink-2`, warna makna); jangan menulis `dark-1/light-1`, hex lepas, atau warna Tailwind bawaan.
- Tema mengikuti sistem: kelas `.dark` di `<html>` dipasang/dilepas otomatis (DESIGN §8.1); periksa tampilan gelap **dan** terang.
- Font dari fontsource lokal, bukan Google Fonts (T13).

## Peta

- `src/components/ui/map.tsx` adalah komponen registry mapcn: **jangan diubah** selain baris worker (25–29, SDD §10.1) agar mudah diperbarui.
- Jangan paksa `theme="dark"`; mapcn membaca kelas `.dark`. Basemap offline lewat `VITE_MAP_STYLE=offline` (SDD §10.2).
- `MapClusterLayer` hanya punya satu `pointColor` — peta kerja memakai `MapMarker` per laporan.

## Data

- Satu klien `lib/apiClient.ts` (`api<T>()`, `ApiError`), base URL dari `VITE_API_URL`. Tanpa React Query/state global; hook per sumber data mengembalikan `{ data, isLoading, error, refetch }` dan memanggil `refetch()` setelah mutasi (tanpa pembaruan optimistis).
- Tipe & label dari `shared/` (snake_case sesuai API). Otorisasi di UI (`ProtectedRoute`) hanya kenyamanan; backend tetap memeriksa.

## Perintah

`npm run dev` (5173) · `npm run build` (harus hijau, termasuk `tsc -b`) · `npm run lint` (saat ini 20 galat bawaan repo lama — jangan menambah galat baru; bersihkan file yang kamu sentuh).
