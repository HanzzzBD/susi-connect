# Mockup Android SUSI Connect

Mockup UI interaktif untuk layar mobile (UI-SPEC bagian M), dibuat sebelum integrasi ke Expo di `mobile/`.
React 19 + Vite + TypeScript + Tailwind v4 + react-router. **Tidak terhubung ke backend**, tanpa request jaringan.
Semua data sintetis (PRD §12) dan berlabel "(sintetis)".

## Menjalankan

```bash
cd mockup
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

## Cara pakai

- **Panel dev** (kiri di layar lebar; tombol bulat kanan atas di layar sempit) — bukan bagian aplikasi:
  - Persona: Tamu, Warga, Relawan, Koordinator, Moderator, Instansi, Admin (tab bawah sesuai UI-SPEC M0).
  - State layar: Sukses / Memuat / Kosong / Galat + varian khusus layar (mis. `HANDLING_MISMATCH`, rute garis lurus).
  - Jaringan: mode cadangan (`AI_MODE=fallback`) dan "terhubung lewat hotspot laptop".
  - Lompat ke layar per ID UI-SPEC.
- Persona juga bisa dipilih lewat URL awal: `http://localhost:5173/aksi/4?persona=relawan` (hanya dibaca sekali, tidak disimpan).

## Struktur

| Folder | Isi |
| --- | --- |
| `src/app/` | Root, router + registri layar (`screens.tsx`), bingkai perangkat 390×844, panel dev, state mock |
| `src/screens/` | Satu file per layar UI-SPEC (`MS01Login.tsx` … `MS22Admin.tsx`, `M0More.tsx`), `system/` untuk 403/404 |
| `src/components/` | Komponen bersama (AppBar, BottomNav, StatusChip, CategoryBadge, AiBadge, ScoreBreakdown, BottomSheet, MapPlaceholder, …) |
| `src/components/ui/` | Primitif: Button, Card, Input, Chip, Toggle |
| `src/data/` | Data mock sintetis dari PRD §12 (`isSynthetic: true`); metrik dihitung dengan rumus PRD §10 |
| `src/theme/` | Token DESIGN.md §7.1 (CSS `@theme` + konstanta TS) |
| `src/lib/` | `labels.ts` (PRD §8 & UI-SPEC), format angka/tanggal, simulasi keluaran AI dari contoh AI-PROMPTS.md |

Peta = kotak abu-abu "Peta (mockup)" dengan titik statis (tanpa MapLibre/tile). AI tidak dipanggil; keluaran disalin dari contoh di `docs/AI-PROMPTS.md`.
