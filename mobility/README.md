# mobility — layanan rekomendasi moda untuk umum

Mesin rute angkutan umum Jabodetabek (TransJakarta, KRL, MRT, LRT, jalan kaki) yang dipakai fitur **M15 Rekomendasi moda untuk umum** SUSI Connect. Kode berasal dari proyek tim sebelumnya, SmartRoute AI, dan dipakai apa adanya sebagai layanan terpisah (SDD §4.2, D21).

| Folder | Isi | Port |
| --- | --- | --- |
| [`backend-skeleton/`](backend-skeleton/) | API rute: `POST /routes`, `GET /stops/search`, `GET /nearby-stops`, `GET /all-stops` (Express 5 + TypeScript) | 3000 |
| [`otp2-setup/`](otp2-setup/) | OpenTripPlanner 2 (Docker) dengan GTFS TransJakarta/KRL/MRT/LRT + peta OSM Jabodetabek | 8080 |

Aplikasi SUSI **tidak** memanggil layanan ini langsung: backend SUSI meneruskan `/api/mobility/*` ke `MOBILITY_URL` (default `http://localhost:3000`) setelah autentikasi (API.md §13A).

## Menjalankan (tiket PRE-18)

Prasyarat: Docker Desktop, Node.js 20+, ± 2 GB disk kosong. Graph OTP (± 205 MB) tidak disimpan di git.

```bash
cd mobility/otp2-setup
./scripts/clip-osm.sh       # unduh & potong peta OSM Jabodetabek (butuh internet, sekali)
./scripts/build-graph.sh    # bangun data/graph.obj
./scripts/serve.sh          # OTP2 di http://localhost:8080 (tanpa internet setelah graph ada)

cd ../backend-skeleton
cp .env.example .env        # OPENROUTER_API_KEY boleh dikosongkan — lihat di bawah
npm install && npm run dev  # http://localhost:3000
```

Versi PowerShell tersedia untuk setiap skrip (`*.ps1`). Detail: [`otp2-setup/README.md`](otp2-setup/README.md).

## Yang tidak dipakai SUSI

- **Asisten AI OpenRouter** (`POST /assistant/ask`, `openRouterClient.ts`): SUSI memakai Gemini (keputusan tim 22 Okt 2026). Endpoint ini tidak diteruskan oleh proxy SUSI, jadi `OPENROUTER_API_KEY` tidak perlu diisi.
- **Laporan kepadatan** (`/crowd-reports`): bukan cakupan SUSI; tidak diteruskan proxy.

## Asal kode

| Folder | Sumber | Commit split |
| --- | --- | --- |
| `backend-skeleton/` | `backend/backend-skeleton/` di [lippbyte/smartroute-app](https://github.com/lippbyte/smartroute-app) (`0a92f40`) | `44460b7` |
| `otp2-setup/` | `backend/otp2-setup/` di repo yang sama | `ba967cb` |

Tabel tarif MRT/KRL/LRT di `backend-skeleton/src/data/` dibuat oleh skrip di `backend/otp2-krl-experiment/` repo asal; folder eksperimen itu tidak ikut dibawa karena tidak dibutuhkan saat aplikasi berjalan.
