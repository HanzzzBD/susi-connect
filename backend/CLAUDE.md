# CLAUDE.md — backend/

API SUSI Connect. Stack **wajib**: Node.js, **JavaScript CommonJS** (`require`/`module.exports`), **Express 4**, `pg` dengan SQL mentah (tanpa ORM), **zod**. Jangan pindah ke TypeScript, ESM, Express 5, atau ORM (SDD D3). Paket ESM-only (mis. `file-type` 22.x) tidak bisa di-`require` — cari alternatif atau tulis sendiri (lihat `lib/magic.js` di SDD §6.7).

## Kondisi saat ini

Isi folder masih smartroute-backend lama (`stations`, `fleets`, `flags`, `admins`, `simulator.js`, dump SQL, `JWT_SECRET` fallback). **BE-01** menghapusnya; jangan menambah fitur di atas kode lama itu. Pola yang dipertahankan: transaksi di `flagController.createFlag` (menjadi `lib/tx.js`), bcrypt cost 10, envelope `{ success, data }`.

## Struktur target (SDD §4)

`src/index.js` · `app.js` · `config/env.js` · `db/pool.js`, `db/migrate.js` (membaca `../../db/migrations`) · `lib/` · `middleware/` · `validation/` · `serializers/` · `routes/*.routes.js` · `controllers/*.controller.js` · `services/` (termasuk `ai/`) · `seed/` · `tests/unit`, `tests/api`, `tests/ai-eval`.

## Aturan lapisan

- **Route** hanya wiring: `rateLimit → requireAuth|optionalAuth → requireRole → validate → controller`.
- **Controller** membaca `req.user` & `req.valid`, memanggil **satu** fungsi service, membalas dengan `respond.ok(res, data, meta?, status?)`.
- **Service** memegang logika, SQL berparameter (`$1`), dan transaksi lewat `withTx`. Melempar `AppError(code, status, message, details?)` dengan kode dari API.md §1.
- **Hanya** `reportStatus.service.transition()` yang menulis `reports.status`; **hanya** `actionStatus.service` yang menulis `actions.status` / `tasks.status`. Konfigurasi transisi persis SDD §6.1–6.2.
- Panggilan jaringan (Gemini, ORS, Expo Push, layanan mobilitas) **di luar** transaksi DB, dengan batas waktu; AI tidak pernah melempar ke controller (fallback).
- Notifikasi ditulis di transaksi pemanggil (`notification.enqueue`); push dikirim setelah commit (`setImmediate`).
- Data yang dibuat akun sintetis ikut `is_synthetic = req.user.is_synthetic`.

## Hak akses

Peran dua tingkat: `users.role` ∈ `warga, moderator, instansi, admin`; relawan/koordinator dari `community_members`. Pakai `requireRole`, `assertScope(user, kecamatan)`, `assertCommunity(user, id, 'koordinator'?)`. Admin lolos semua kecuali `SELF_VERIFICATION`. Setiap route baru ditambahkan ke tabel `tests/api/rbac.test.js`.

## Uji

`node --test` untuk unit, `supertest` + DB `susi_test` untuk API. Setiap endpoint: 1 sukses + 401 + 403/404 peran salah (PRD §11.2 memetakan endpoint → file uji). Gemini, ORS, Expo Push, dan layanan mobilitas **selalu di-mock** di uji.

## Env

Daftar lengkap & validasi di SDD §5.2 (`config/env.js`). Server harus gagal start bila `JWT_SECRET` < 32 karakter atau `DATABASE_URL` kosong. Tambahan: `MOBILITY_URL` (SDD §4.2). Perbarui `.env.example` setiap menambah variabel.
