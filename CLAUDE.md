# CLAUDE.md — SUSI Connect (monorepo)

SUSI Connect mengubah laporan masalah warga menjadi aksi yang terkoordinasi dan terbukti selesai. Hackathon LOGICODIX 2026, cabang **Mobile App Development**. Masa pengerjaan 7–14 Nov 2026, submission Sabtu 14 Nov (tag `v1.0.0`), Grand Final 29 Nov **di localhost tanpa jaminan internet**.

File ini berlaku untuk seluruh repo. Setiap folder punya `CLAUDE.md` sendiri dengan aturan yang lebih rinci; aturan folder menang bila lebih spesifik. Aturan repo ini **menang atas CLAUDE.md global** bila bertentangan.

## Sumber kebenaran

Baca bagian yang relevan **sebelum** menulis kode. Jangan menebak nama tabel, kolom, endpoint, status, kode galat, atau teks UI.

| Dokumen | Untuk |
| --- | --- |
| `docs/PRD.md` | Fitur (M01–M17, S01–S06), kriteria Given/When/Then §9, kamus istilah §8, data seed §12 |
| `docs/SDD.md` | Arsitektur, service, state machine (§6.1–6.2), frontend §8, mobile §8A, offline §10, git §12 |
| `docs/API.md` | Kontrak setiap endpoint: skema zod, respons, `error.code`, efek samping |
| `db/migrations/00N_*.sql` | Skema PostgreSQL final |
| `docs/UI-SPEC.md` | Elemen, state, dan **teks UI final** setiap layar web (S01–S18) & mobile (M) |
| `docs/DESIGN.md` | Token & resep kelas: web §2–6, mobile §7 |
| `docs/AI-PROMPTS.md` | Prompt final, skema keluaran, kamus fallback & bahaya |
| `docs/TICKETS.md` · `docs/TASKS.md` | Jadwal, pemilik, urutan (§2), dan task rinci per tiket |
| `docs/AUDIT-SMARTROUTE-APP.md` | Apa yang dipakai ulang dari app SmartRoute |

Bila kode dan dokumen bertentangan, **perbaiki dokumennya dulu** (PR `docs`) lalu kode — jangan diam-diam menyimpang. Setiap dokumen punya tabel *Log Perubahan*; tambahkan baris saat mengubahnya.

## Struktur

| Folder | Isi | Status saat ini |
| --- | --- | --- |
| `backend/` | API SUSI: Express 4, JavaScript CommonJS, `pg`, zod, Gemini, OpenRouteService | Masih kode smartroute-backend lama (dibersihkan di BE-01) |
| `web/` | Web pendamping (S01, S02, S06, S07, S14, S15, S17): React 19 + TS + Vite + Tailwind v4 + shadcn + mapcn | Masih smartroute-dashboard lama (`baseUrl` sudah dihapus) |
| `mobile/` | Aplikasi utama Expo 57 + expo-router + NativeWind + MapLibre RN 11 | Masih app SmartRoute (dipangkas & diganti identitas di MB-01) |
| `mobility/` | Layanan rute angkutan umum SmartRoute (TS + OTP2), dipanggil lewat proxy `/api/mobility/*` | Dipakai apa adanya |
| `db/migrations/` | Migrasi SQL bernomor | 001–006 |
| `shared/` | `types.ts`, `labels.ts`, `validation.ts` untuk web & mobile | Belum ada (FS-02, MB-02) |

## Alur kerja

- Saat diminta mengerjakan tiket/task, gunakan skill **`dev-workflow`** (sesuai CLAUDE.md global), dengan aturan repo ini sebagai batasan.
- Sebelum mulai: baca baris tiket di `TICKETS.md` §3, semua task tiket itu di `TASKS.md` (perhatikan penanda **♻ Sebagian/Pola dari app SmartRoute** — buka file asalnya dulu), kriteria GWT terkait di `PRD.md` §9, dan bagian rujukannya.
- Satu tiket = satu branch `<jenis>/<ID>-<slug>` (`feat`, `fix`, `docs`, `chore`, `test`, `refactor`), mis. `feat/BE-11-report-verify`.
- Commit: Conventional Commits berbahasa Indonesia, `<jenis>(<cakupan>): <ringkas> (<ID>)`. Cakupan: `api`, `db`, `ai`, `web`, `mobile`, `shared`, `map`, `seed`, `mobility`, `docs`, `ci`.
- **`main` terproteksi**: wajib PR + 1 review, tanpa force-push. Jangan pernah mencoba push langsung ke `main`.
- Selesai = semua task tiket tercentang + Definition of Done (`TICKETS.md` §1): GWT lulus, uji hijau, jalan di mode cadangan bila menyentuh AI/rute/peta, teks sesuai UI-SPEC, keluaran AI berlabel.

## Aturan keras

1. **Migrasi yang sudah di `main` tidak diubah.** Perubahan skema = file baru `db/migrations/00N_<nama>.sql` + baris di Log Perubahan file & SDD.
2. **Jangan commit** `.env`, kunci API, `uploads/`, `mobility/otp2-setup/data/graph.obj`, `node_modules/`, file PMTiles > 50 MB.
3. **AI hanya memberi saran.** Status laporan/aksi diubah hanya oleh `reportStatus.service` / `actionStatus.service` atas tindakan manusia; kamus bahaya (`applyHardRules`) selalu menimpa AI; setiap keluaran AI berlabel di UI (`AiBadge`).
4. **Privasi:** payload ke Gemini dibangun dari allowlist + `redactPII`; tanpa nama, email, nomor HP, koordinat persis, foto (kecuali S04 aktif). Foto dibuang EXIF-nya. Peta publik memakai `reports_public` (dibulatkan 3 desimal).
5. **Harus jalan tanpa internet:** fitur yang memanggil Gemini, ORS, basemap, atau push wajib punya jalur cadangan (`AI_MODE=fallback`, `ROUTING_MODE=cache|straight`, basemap offline, notifikasi in-app).
6. **Kontrak API:** JSON snake_case; envelope `{ success, data, meta? }` / `{ success: false, data: null, error: { code, message, details } }`; kode galat hanya dari API.md §1.
7. **Teks UI berbahasa Indonesia, persis UI-SPEC.** Label status/kategori dari `shared/labels.ts`, bukan ditulis ulang.
8. **Kejujuran data:** jangan mengarang statistik, hasil uji, kuota API, atau harga. Pakai penanda `[PERLU DIVERIFIKASI]`, `[PERLU DATA]`, `[ASUMSI]`. Data seed selalu `is_synthetic=true` dan berlabel "(sintetis)".
9. **Tidak ada klaim integrasi instansi.** Rujukan hanya draf + tautan kanal resmi.
10. **OpenRouter tidak dipakai** (keputusan 32). Semua AI lewat `backend/src/services/ai/aiService.js` (Gemini).

## Menjalankan (kondisi saat ini)

```bash
cd web && npm install && npm run build   # build lolos; `npm run lint` masih 20 galat bawaan repo lama
cd backend && npm install && npm run dev # kode lama, butuh DB "smartroute"
cd mobile && npm install && npx expo start  # butuh development build (bukan Expo Go)
```

Perintah final (setelah BE-02, DA-02, BE-05): `npm run db:migrate`, `npm run seed`, `npm test` di `backend/` — lihat SDD §11.
