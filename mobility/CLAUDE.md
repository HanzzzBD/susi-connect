# CLAUDE.md — mobility/

Layanan rute angkutan umum (TransJakarta, KRL, MRT, LRT, jalan kaki) dari SmartRoute AI, dipakai fitur **M15 Rekomendasi moda untuk umum**. Dipakai **apa adanya** sebagai layanan terpisah (SDD §4.2, D21).

- `backend-skeleton/` — Express 5 + **TypeScript** (port 3000). Bahasanya memang berbeda dari `backend/` (JS CommonJS); jangan menyamakan atau memindahkan kode antar keduanya.
- `otp2-setup/` — OpenTripPlanner 2 di Docker (port 8080) + GTFS. Graph `data/graph.obj` (± 205 MB) dibangun lokal dan **tidak pernah di-commit**.

## Aturan

- **Jangan mengubah logika rute, tarif, atau skor** kecuali tiket memintanya; perubahan cukup di konfigurasi/env. Bila perlu mengubah kode, catat di `mobility/README.md`.
- Aplikasi SUSI tidak memanggil layanan ini langsung; backend SUSI meneruskan `POST /routes`, `GET /stops/search`, `GET /nearby-stops` lewat `/api/mobility/*` (API.md §13A). Endpoint lain (`/assistant/ask`, `/crowd-reports`) **tidak dipakai** — asisten OpenRouter diganti Gemini SUSI (keputusan 32), jadi `OPENROUTER_API_KEY` boleh kosong.
- Jalur relatif `backend-skeleton` → `../otp2-setup/data/*.zip` harus tetap utuh; jangan memindah salah satu folder.
- Uji regresi rute: `backend-skeleton/scripts/regression-routes.mjs` (tiket MV-03); hasil ditulis apa adanya.

## Menjalankan

```bash
cd otp2-setup && ./scripts/clip-osm.sh && ./scripts/build-graph.sh && ./scripts/serve.sh   # sekali butuh internet untuk OSM
cd ../backend-skeleton && cp .env.example .env && npm install && npm run dev              # http://localhost:3000
npm run typecheck
```

Versi PowerShell setiap skrip: `*.ps1`. Detail: `mobility/README.md`, `otp2-setup/README.md`.
