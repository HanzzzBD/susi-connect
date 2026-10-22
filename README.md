# SUSI Connect

Aplikasi civic tech yang mengubah laporan masalah warga menjadi aksi yang terkoordinasi dan terbukti selesai — mempertemukan laporan dengan komunitas, relawan, atau kanal resmi instansi, lalu memandu mereka sampai ke lokasi.

LOGICODIX 2026 · cabang **Mobile App Development** · Subtema 5 Civic Tech & Community Service.

> **Status (22 Okt 2026):** fondasi monorepo. Folder `web/`, `backend/`, dan `mobile/` masih berisi kode dasar dari proyek tim sebelumnya (lihat *Asal kode*) dan **belum** diubah ke domain SUSI. Pengerjaan fitur dimulai 7 Nov 2026 sesuai [docs/TICKETS.md](docs/TICKETS.md).

## Isi repo

| Folder | Isi | Stack |
| --- | --- | --- |
| [`mobile/`](mobile/) | Aplikasi utama untuk warga, relawan, koordinator, moderator, instansi | Expo SDK 57, React Native 0.86, expo-router, NativeWind, MapLibre RN 11 |
| [`web/`](web/) | Web pendamping: peta publik, moderasi, dashboard dampak, admin | React 19, TypeScript, Vite, Tailwind v4, shadcn, MapLibre (mapcn) |
| [`backend/`](backend/) | REST API, triase AI (Gemini), matching, rute (OpenRouteService) | Node.js, Express 4, PostgreSQL (`pg`), zod |
| [`db/migrations/`](db/migrations/) | Skema PostgreSQL SUSI (001–005) | SQL |
| [`docs/`](docs/) | PRD, SDD, API, UI-SPEC, DESIGN, AI-PROMPTS, TICKETS, TASKS, DEMO-SCRIPT, audit | Markdown |

## Dokumen

| Dokumen | Isi |
| --- | --- |
| [PRD](docs/PRD.md) | Masalah, fitur, kriteria Given/When/Then, metrik, data seed |
| [SDD](docs/SDD.md) | Arsitektur, service, model data, frontend, mobile, offline, git |
| [API](docs/API.md) | Kontrak 73 endpoint |
| [UI-SPEC](docs/UI-SPEC.md) | Layar web & mobile, teks UI |
| [DESIGN](docs/DESIGN.md) | Sistem desain web (gaya smartroute-dashboard) & mobile (gaya app SmartRoute) |
| [AI-PROMPTS](docs/AI-PROMPTS.md) | Prompt, skema, kamus fallback |
| [TICKETS](docs/TICKETS.md) | Jadwal, kapasitas, urutan pengerjaan |
| [TASKS](docs/TASKS.md) · [tasks.csv](docs/tasks.csv) | Task rinci per fitur (impor ke GitHub Projects) |
| [DEMO-SCRIPT](docs/DEMO-SCRIPT.md) | Naskah demo Grand Final & video |
| [AUDIT-SMARTROUTE-APP](docs/AUDIT-SMARTROUTE-APP.md) | Apa yang dipakai ulang dari app SmartRoute |

## Asal kode

Kode dasar berasal dari proyek tim sebelumnya, SmartRoute AI, yang belum pernah diikutsertakan dalam lomba. Panitia telah mengizinkan pemakaiannya (dikonfirmasi tim, 22 Okt 2026). Riwayat commit asli dipertahankan lewat `git subtree`.

| Folder | Sumber | Commit |
| --- | --- | --- |
| `web/` | [inouerakan/smartroute-dashboard](https://github.com/inouerakan/smartroute-dashboard) `main` | `b1787c9` |
| `backend/` | [inouerakan/smartroute-backend](https://github.com/inouerakan/smartroute-backend) `main` | `fecdbc0` |
| `mobile/` | folder `smartroute/` di [lippbyte/smartroute-app](https://github.com/lippbyte/smartroute-app) | split `351cfcb` (repo `0a92f40`) |

Perubahan sejak impor: `web/tsconfig*.json` — `baseUrl` dihapus agar build TypeScript 6 lolos (SDD §2.1 T14). `mobile/LICENSE` adalah lisensi MIT bawaan templat Expo.

## Menjalankan (kode dasar saat ini)

Prasyarat: Node.js 20+, PostgreSQL 16+. Langkah final untuk SUSI ada di [SDD §11](docs/SDD.md) dan akan diperbarui saat fitur selesai.

```bash
# web (dashboard lama)
cd web && npm install && npm run dev            # http://localhost:5173

# backend (API dashboard lama — butuh DB "smartroute" dari dump, lihat docs)
cd backend && npm install && npm run dev        # http://localhost:5000

# mobile (app SmartRoute — butuh development build, lihat mobile/README.md)
cd mobile && npm install && npx expo start
```

## Kontribusi

Branch `feat|fix|docs|chore/<ID-tiket>-<slug>`, Conventional Commits berbahasa Indonesia, PR ke `main` dengan 1 review, squash merge ([SDD §12](docs/SDD.md)). Rahasia (`.env`) tidak pernah di-commit.
