# API SUSI Connect — Kontrak Endpoint

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.2 · **Status:** siap dipakai untuk tiket BE/FS
**Dirujuk dari:** [SDD.md](SDD.md) §5 · **Skema DB:** [`db/migrations/`](../db/migrations)

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru. Menggantikan tabel endpoint PRD v1 §14 dan aturan SDD v1 §5. Perbaikan inkonsistensi: (1) `POST /routes` (PRD) → `GET /routes` (SDD), dipilih **GET** karena idempoten dan bisa di-cache; (2) nilai `source` rute `live` (PRD) → `ors` (SDD), dipilih **`ors`**; (3) `PATCH /actions/:id/status` dan `DELETE /obstacles/:id` diganti endpoint aksi bernama (`/start`, `/submit`, `/cancel`, `/revoke`) sesuai aturan SDD; (4) `POST /auth/demo-login {role}` → `{email}` karena peran kini dua tingkat; (5) chatbot FAQ menjadi `POST /chat/faq` stateless, sesi chat hanya untuk mode lapor; (6) seluruh JSON memakai **snake_case** seperti baris PostgreSQL di repo lama (SDD v1 memakai camelCase di respons rute); (7) envelope galat memakai `error.code` (repo lama memakai `message` di tingkat atas). |
| 1.1 | 22 Okt 2026 | Hasil audit: R3 `status` menerima beberapa nilai (filter "Dalam penanganan" di S02 butuh 3 status); K1 menambah `breakdown` (hitungan laporan & aksi per status, tugas terbuka) untuk kartu dashboard; `?token=` dibatasi ke `/files/*`. |
| 1.2 | 22 Okt 2026 | Klien kedua (aplikasi mobile Expo) memakai kontrak yang sama lewat Cloudflare Tunnel/hotspot; mobile mengirim token lewat header juga untuk foto, sehingga `?token=` hanya dipakai web. |

---

## 1. Konvensi umum

**Basis URL:** `http://localhost:5000/api` (web, `VITE_API_URL`); aplikasi mobile memakai `https://api.<domain>/api` lewat Cloudflare Tunnel dengan cadangan `http://<IP-hotspot>:5000/api` (SDD §8A.6). Kontrak identik untuk kedua klien.

**Autentikasi:** header `Authorization: Bearer <jwt>`. JWT HS256 berisi `{ sub, role }`, berlaku 8 jam. Keanggotaan komunitas dibaca dari DB setiap request.

**Envelope sukses**

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 42 } }
```

`meta` hanya ada pada daftar.

**Envelope galat**

```json
{ "success": false, "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "Deskripsi minimal 20 karakter", "details": [{ "path": "description", "message": "Deskripsi minimal 20 karakter" }] } }
```

**Kode galat** (berlaku untuk semua endpoint; bagian per endpoint hanya menyebut yang khas)

| HTTP | `error.code` | Arti |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | zod gagal; `details[]` berisi `path` + `message` berbahasa Indonesia |
| 401 | `AUTH_REQUIRED` | Header Authorization tidak ada |
| 401 | `AUTH_INVALID` | Token salah/kedaluwarsa, atau email/kata sandi salah |
| 403 | `FORBIDDEN_ROLE` | Peran global tidak cukup |
| 403 | `FORBIDDEN_SCOPE` | Moderator/instansi di luar `scope_kecamatan` |
| 403 | `FORBIDDEN_COMMUNITY` | Bukan koordinator/anggota komunitas terkait |
| 403 | `SELF_VERIFICATION` | Pengunggah bukti/pembuat laporan memverifikasi miliknya sendiri |
| 403 | `DEMO_DISABLED` | `DEMO_MODE` bukan `true` |
| 404 | `NOT_FOUND` | Tidak ada, atau tidak boleh dilihat (tidak membedakan keduanya) |
| 409 | `REPORT_INVALID_TRANSITION` | Transisi laporan tidak sah (lihat SDD §6.1) |
| 409 | `ACTION_INVALID_TRANSITION` | Transisi aksi/tugas tidak sah |
| 409 | `HANDLING_MISMATCH` | Mis. verifikasi laporan `instansi` atau berpenanda bahaya |
| 409 | `TASK_QUOTA_FULL` | Kuota tugas penuh |
| 409 | `ALREADY_EXISTS` | Duplikat (email, anggota, konfirmasi, match diterima) |
| 409 | `EVIDENCE_REQUIRED` | Butuh bukti `after` (sah) terlebih dulu |
| 413 | `FILE_TOO_LARGE` | Foto > 5 MB |
| 415 | `UNSUPPORTED_MEDIA` | Bukan JPEG/PNG/WebP (dicek MIME + magic bytes) |
| 422 | `OUT_OF_PILOT_AREA` | Koordinat di luar `PILOT_BOUNDS` (DKI Jakarta) |
| 429 | `RATE_LIMITED` | Lebih dari batas `rateLimit.js` |
| 502 | `UPSTREAM_FAILED` | Hanya bila fallback juga gagal |
| 500 | `INTERNAL` | Galat tak terduga; detail hanya di log |

**Peran pada tabel endpoint**

| Notasi | Arti |
| --- | --- |
| `publik` | Tanpa token |
| `login` | Token sah, peran apa pun |
| `warga`, `moderator`, `instansi`, `admin` | `users.role` |
| `moderator(W)`, `instansi(W)` | Peran itu **dan** `scope_kecamatan = report.kecamatan` |
| `koordinator(K)` | `community_members.member_role='koordinator'` di komunitas terkait |
| `anggota(K)` | Baris apa pun di `community_members` komunitas terkait (= relawan) |
| `pelapor` | `reports.reporter_id = req.user.id` |

`admin` selalu lolos pemeriksaan peran dan wilayah, kecuali aturan `SELF_VERIFICATION`.

**Pagination:** semua daftar menerima `?page=1&limit=20` (maks 100), urut terbaru dulu kecuali disebut lain.

**Rate limit** [ASUMSI]: `/auth/login` & `/auth/demo-login` 10 permintaan / 15 menit / IP; endpoint yang memanggil AI 10 / menit / pengguna (FAQ publik: per IP); lainnya 100 / menit / IP.

**Audit:** setiap endpoint yang mengubah data menulis `audit_logs(action, entity, entity_id, meta)` dengan `action = <entity>.<verb>` (mis. `report.verify`).

### 1.1 Skema zod bersama

Disimpan di `backend/src/validation/common.js`.

```js
// backend/src/validation/common.js
const { z } = require('zod');
const env = require('../config/env');

const id = z.coerce.number().int().positive();
const idParams = z.object({ id });

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// PILOT_BOUNDS = "minLng,minLat,maxLng,maxLat" (DKI Jakarta daratan) [PERLU DIVERIFIKASI nilainya]
const [minLng, minLat, maxLng, maxLat] = env.PILOT_BOUNDS;
const lat = z.coerce.number().min(-90).max(90);
const lng = z.coerce.number().min(-180).max(180);
const point = z.object({ lat, lng }).refine(
  (p) => p.lat >= minLat && p.lat <= maxLat && p.lng >= minLng && p.lng <= maxLng,
  { message: 'Lokasi di luar wilayah pilot DKI Jakarta', params: { code: 'OUT_OF_PILOT_AREA' } },
);

const CATEGORIES = ['sampah', 'drainase', 'jalan_trotoar', 'penerangan', 'fasilitas_umum', 'lingkungan_lain', 'sosial'];
const URGENCIES = ['rendah', 'sedang', 'tinggi', 'darurat'];
const HANDLINGS = ['komunitas', 'instansi', 'campuran'];
const HAZARDS = ['limbah_medis', 'limbah_b3_kimia', 'asbes', 'struktur_rusak', 'listrik', 'lahan_privat', 'hewan_berbahaya', 'air_dalam'];
const SKILLS = ['angkut', 'pilah', 'dokumentasi', 'bersih_saluran', 'logistik', 'pendampingan', 'perbaikan_ringan'];
const OBSTACLE_TYPES = ['perbaikan_jalan', 'demo', 'banjir', 'pohon_tumbang', 'kegiatan_warga', 'lainnya'];
const PROFILES = ['foot-walking', 'cycling-regular', 'driving-car'];
const REJECT_REASONS = ['palsu', 'duplikat', 'di_luar_cakupan', 'data_kurang', 'lainnya'];

const text = (min, max, label) =>
  z.string().trim()
    .min(min, `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`);

module.exports = { z, id, idParams, pagination, point, lat, lng, text,
  CATEGORIES, URGENCIES, HANDLINGS, HAZARDS, SKILLS, OBSTACLE_TYPES, PROFILES, REJECT_REASONS };
```

Upload multipart divalidasi oleh `middleware/upload.js` (multer memory storage): field `photos` (laporan, maks 3) atau `photo` (bukti, 1); tipe `image/jpeg|png|webp` dicek dari magic bytes; ≤ 5 MB per file. Field teks multipart di-parse dengan skema zod yang sama setelah `JSON.parse` field `payload`.

### 1.2 Objek data (DTO)

Semua respons memakai bentuk berikut; field yang tidak boleh dilihat peran tertentu dihapus oleh `serializers/*.js`, bukan oleh frontend.

```jsonc
// ReportDTO — untuk pelapor, moderator(W), koordinator(K) penangan, anggota(K) aksi terkait, admin
{
  "id": 41, "title": "Sampah menumpuk di lahan kosong dekat musala",
  "description": "Di lahan kosong samping musala sampah numpuk seminggu, bau dan banyak lalat.",
  "category": "sampah", "urgency": "sedang", "handling": "komunitas",
  "hazard_flags": [], "required_skills": ["angkut", "pilah"], "est_volunteers": 8,
  "latitude": -6.23187, "longitude": 106.85412,
  "address_text": "Lahan kosong samping Musala Al-Ikhlas, RT 03/RW 05",
  "kelurahan": "Tebet Barat", "kecamatan": "Tebet",
  "status": "menunggu", "ai_status": "done", "source": "chat",
  "reporter": { "id": 7, "display_name": "Warga Tebet Barat" },
  "photos": [{ "id": 90, "url": "/api/files/report-photos/90" }],
  "triage": { "ai_analysis_id": 301, "provider": "gemini", "reason": "Sampah rumah tangga …", "confidence": "sedang", "overridden": false },
  "is_synthetic": true, "created_at": "2026-11-07T09:12:00+07:00",
  "verified_at": null, "resolved_at": null
}
// ReportPublicDTO — GET /reports/public (dari view reports_public)
{ "id": 41, "category": "sampah", "status": "menunggu", "urgency": "sedang",
  "kecamatan": "Tebet", "kelurahan": "Tebet Barat",
  "lat_approx": -6.232, "lng_approx": 106.854, "is_synthetic": true, "created_at": "…" }
```

`reporter.display_name` selalu "Warga <kelurahan>" kecuali bagi admin dan pelapor sendiri. `confidence` ditampilkan sebagai kata (`rendah` < 0,5 ≤ `sedang` < 0,8 ≤ `tinggi`), bukan persen.

---

## 2. Ringkasan endpoint

| ID | Method | Path | Peran | AI | ORS |
| --- | --- | --- | --- | --- | --- |
| A1 | POST | `/auth/login` | publik | — | — |
| A2 | POST | `/auth/demo-login` | publik (`DEMO_MODE`) | — | — |
| A3 | GET | `/auth/demo-accounts` | publik (`DEMO_MODE`) | — | — |
| A4 | GET | `/auth/me` | login | — | — |
| A5 | PATCH | `/auth/me` | login | — | — |
| R1 | POST | `/reports` | login | triage (asinkron) | — |
| R2 | GET | `/reports` | login | — | — |
| R3 | GET | `/reports/public` | publik | — | — |
| R4 | GET | `/reports/:id` | pelapor, moderator(W), koordinator(K), anggota(K), instansi(W), admin | — | — |
| R5 | POST | `/reports/:id/verify` | moderator(W) | — (matching aturan) | — |
| R6 | POST | `/reports/:id/forward` | moderator(W) | agency_draft | — |
| R7 | POST | `/reports/:id/reject` | moderator(W) | — | — |
| R8 | POST | `/reports/:id/return` | moderator(W) | — | — |
| R9 | POST | `/reports/:id/reopen` | admin | — | — |
| R10 | GET | `/reports/:id/duplicates` | moderator(W) | — | — |
| R11 | GET | `/reports/:id/matches` | moderator(W), koordinator(K) | — | — |
| R12 | POST | `/reports/:id/action-plan` | koordinator(K) | action_plan | — |
| C1 | POST | `/chat/sessions` | login | — | — |
| C2 | POST | `/chat/sessions/:id/messages` | pemilik sesi | chat_extract | — |
| C3 | POST | `/chat/sessions/:id/confirm` | pemilik sesi | triage (asinkron) | — |
| C4 | POST | `/chat/faq` | publik | faq | — |
| M1 | GET | `/communities/:id/matches` | koordinator(K) | — | — |
| M2 | POST | `/matches/:id/accept` | koordinator(K) | — | — |
| M3 | POST | `/matches/:id/decline` | koordinator(K) | — | — |
| X1 | POST | `/actions` | koordinator(K) | — | — |
| X2 | GET | `/actions` | login | — | — |
| X3 | GET | `/actions/:id` | anggota(K), moderator(W), pelapor, admin | — | — |
| X4 | PATCH | `/actions/:id` | koordinator(K) | — | — |
| X5 | POST | `/actions/:id/start` | koordinator(K) | — | — |
| X6 | POST | `/actions/:id/submit` | koordinator(K) | — | — |
| X7 | POST | `/actions/:id/cancel` | koordinator(K) | — | — |
| T1 | POST | `/actions/:id/tasks` | koordinator(K) | — | — |
| T2 | POST | `/tasks/:id/claim` | anggota(K) | — | — |
| T3 | POST | `/tasks/:id/release` | anggota(K) yang ditugaskan | — | — |
| T4 | POST | `/tasks/:id/assign` | koordinator(K) | — | — |
| T5 | POST | `/tasks/:id/checkin` | anggota(K) yang ditugaskan | — | — |
| T6 | POST | `/tasks/:id/complete` | anggota(K) yang ditugaskan, koordinator(K) | — | — |
| E1 | POST | `/actions/:id/evidences` | anggota(K) yang ditugaskan, koordinator(K) | — | — |
| E2 | POST | `/referrals/:id/evidences` | moderator(W), instansi(W), pelapor | — | — |
| E3 | POST | `/evidences/:id/verify` | moderator(W), pelapor (bukan pengunggah) | — | — |
| E4 | GET | `/evidences/pending` | moderator, pelapor | — | — |
| F1 | GET | `/referrals` | moderator, instansi, admin | — | — |
| F2 | GET | `/referrals/:id` | moderator(W), instansi(W), pelapor, admin | — | — |
| F3 | PATCH | `/referrals/:id` | moderator(W), instansi(W), pelapor (hanya `sent`) | — | — |
| F4 | POST | `/referrals/:id/complete` | moderator(W), instansi(W) | — | — |
| O1 | GET | `/obstacles` | publik | — | — |
| O2 | POST | `/obstacles` | koordinator (komunitas mana pun), moderator, instansi, admin; S01: login | — | — |
| O3 | POST | `/obstacles/:id/confirm` | login (S01) | — | — |
| O4 | POST | `/obstacles/:id/revoke` | pembuat, moderator, admin | — | — |
| P1 | GET | `/routes` | anggota(K) aksi terkait, koordinator(K) | — | ya |
| P2 | GET | `/routes/compare` | sama dengan P1 (S02) | — | ya |
| K1 | GET | `/metrics/impact` | publik (ringkas) / login (detail) | — | — |
| G1 | GET | `/communities` | publik | — | — |
| G2 | GET | `/communities/:id` | publik | — | — |
| G3 | POST | `/communities` | admin | — | — |
| G4 | PATCH | `/communities/:id` | koordinator(K), admin | — | — |
| G5 | POST | `/communities/:id/members` | koordinator(K), admin | — | — |
| G6 | DELETE | `/communities/:id/members/:userId` | koordinator(K), admin | — | — |
| H1 | GET | `/agencies` | login | — | — |
| H2 | POST | `/agencies` | admin | — | — |
| H3 | PATCH | `/agencies/:id` | admin | — | — |
| N1 | GET | `/notifications` | login | — | — |
| N2 | POST | `/notifications/:id/read` | pemilik | — | — |
| N3 | POST | `/notifications/read-all` | login | — | — |
| U1 | GET | `/admin/users` | admin | — | — |
| U2 | POST | `/admin/users` | admin | — | — |
| U3 | PATCH | `/admin/users/:id` | admin | — | — |
| U4 | GET | `/admin/ai-logs` | admin | — | — |
| Z1 | GET | `/health` | publik | — | — |
| Z2 | GET | `/files/report-photos/:id`, `/files/evidences/:id` | sama dengan hak lihat laporan/aksi induk | — | — |
| Z3 | GET | `/areas` | publik | — | — |
| Z4 | GET | `/categories` | publik | — | — |

Total: 72 baris, 73 endpoint (Z2 berisi dua path). Setiap endpoint punya minimal satu uji API di `backend/tests/api/` (lihat matriks keterlacakan PRD §11).

---

## 3. Auth (A1–A5)

### A1 `POST /auth/login`

- **Peran:** publik · **AI/ORS:** tidak · **Rate limit:** 10 / 15 menit / IP
- **Efek samping:** `users.last_login = now()`; `audit_logs` `auth.login` (berhasil saja).

```js
const body = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid').max(150),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(72),
});
```

```http
POST /api/auth/login
{ "email": "rina.warga@demo.susi.id", "password": "Demo@12345" }
```

```json
{ "success": true, "data": {
  "token": "eyJhbGciOiJIUzI1NiIs…",
  "user": { "id": 7, "name": "Rina (demo)", "email": "rina.warga@demo.susi.id", "role": "warga",
            "scope_kecamatan": null, "is_available": false,
            "communities": [] } } }
```

**Galat:** 400 `VALIDATION_ERROR`; 401 `AUTH_INVALID` ("Email atau kata sandi salah", sama untuk email tak terdaftar); 429 `RATE_LIMITED`.

### A2 `POST /auth/demo-login`

- **Peran:** publik, hanya jika `DEMO_MODE=true` · **Efek samping:** sama dengan A1 + `audit_logs` `auth.demo_login`.

```js
const body = z.object({ email: z.string().email().endsWith('@demo.susi.id') });
```

```http
POST /api/auth/demo-login
{ "email": "sari.koordinator@demo.susi.id" }
```

Respons sama dengan A1.
**Galat:** 403 `DEMO_DISABLED`; 404 `NOT_FOUND` (email bukan akun `is_demo=true`).

### A3 `GET /auth/demo-accounts`

- **Peran:** publik, hanya jika `DEMO_MODE=true` · **Efek samping:** tidak ada.
- **Skema:** tanpa input.

```json
{ "success": true, "data": [
  { "email": "rina.warga@demo.susi.id", "label": "Warga — Rina", "persona": "warga" },
  { "email": "dimas.relawan@demo.susi.id", "label": "Relawan — Dimas", "persona": "relawan" },
  { "email": "sari.koordinator@demo.susi.id", "label": "Koordinator — Kak Sari", "persona": "koordinator" },
  { "email": "budi.moderator@demo.susi.id", "label": "Moderator Tebet — Pak Budi", "persona": "moderator" },
  { "email": "lina.instansi@demo.susi.id", "label": "Petugas Kelurahan — Lina", "persona": "instansi" },
  { "email": "admin@demo.susi.id", "label": "Admin", "persona": "admin" } ] }
```

`persona` dihitung server: `relawan` bila warga punya baris `anggota`, `koordinator` bila punya `koordinator`.
**Galat:** 403 `DEMO_DISABLED`.

### A4 `GET /auth/me`

- **Peran:** login · **Efek samping:** tidak ada.

```json
{ "success": true, "data": { "id": 12, "name": "Dimas (demo)", "email": "dimas.relawan@demo.susi.id",
  "role": "warga", "scope_kecamatan": null, "is_available": true,
  "communities": [{ "id": 1, "name": "Bank Sampah Melati (sintetis)", "member_role": "anggota" }] } }
```

**Galat:** 401 `AUTH_REQUIRED` / `AUTH_INVALID`.

### A5 `PATCH /auth/me`

- **Peran:** login · **Efek samping:** `users` diperbarui; `audit_logs` `user.update_self`.

```js
const body = z.object({
  name: text(2, 100, 'Nama').optional(),
  is_available: z.boolean().optional(),
}).refine((b) => Object.keys(b).length > 0, 'Tidak ada perubahan');
```

```http
PATCH /api/auth/me
{ "is_available": true }
```

Respons: objek pengguna seperti A4. **Galat:** 400, 401.

---

## 4. Laporan (R1–R12)

### R1 `POST /reports`

- **Peran:** login (semua peran boleh melapor) · **AI:** `triage` dijalankan **setelah** respons 201 (job dalam proses, `setImmediate`) · **ORS:** tidak
- **Efek samping:** `reports` (status `menunggu`, `ai_status='pending'`), `report_photos` (file WebP tanpa EXIF di `UPLOAD_DIR/reports/`), `report_status_history` (event `create`), `audit_logs` `report.create`; setelah triase: `ai_analyses` (purpose `triage`), `reports.category/urgency/handling/hazard_flags/required_skills/est_volunteers/ai_status`, notifikasi `report_status` ke moderator wilayah ("Laporan baru menunggu verifikasi").
- **Format:** `multipart/form-data` dengan field `payload` (JSON) dan `photos` (0–3 file).

```js
const payload = z.object({
  title: text(5, 200, 'Judul').optional(),
  description: text(20, 2000, 'Deskripsi'),
  category: z.enum(CATEGORIES, { message: 'Pilih kategori' }),
  location: point,
  address_text: text(3, 300, 'Patokan lokasi').optional(),
  kelurahan: text(2, 100, 'Kelurahan'),
  kecamatan: text(2, 100, 'Kecamatan'),
}).refine(async (p) => areasRepo.exists(p.kecamatan, p.kelurahan),
  { message: 'Kelurahan tidak dikenal', path: ['kelurahan'] });
```

```http
POST /api/reports   (multipart)
payload = {"description":"Sampah numpuk seminggu di lahan kosong samping musala, bau dan banyak lalat.",
           "category":"sampah","location":{"lat":-6.23187,"lng":106.85412},
           "address_text":"Samping Musala Al-Ikhlas RT 03","kelurahan":"Tebet Barat","kecamatan":"Tebet"}
photos  = sampah1.jpg
```

```json
{ "success": true, "data": { "id": 41, "status": "menunggu", "ai_status": "pending",
  "title": "Sampah numpuk seminggu di lahan kosong samping musala, ba…" } }
```

Frontend lalu polling R4 tiap 2 dtk, maks 15 dtk, sampai `ai_status ≠ pending` [ASUMSI].
**Galat:** 400 (incl. kelurahan tidak dikenal); 401; 413 `FILE_TOO_LARGE`; 415 `UNSUPPORTED_MEDIA`; 422 `OUT_OF_PILOT_AREA`; 429.

### R2 `GET /reports`

- **Peran:** login. Hasil difilter otomatis: warga → laporan sendiri; moderator/instansi → `kecamatan = scope_kecamatan`; anggota/koordinator → laporan yang punya aksi komunitasnya; admin → semua.
- **Efek samping:** tidak ada.

```js
const query = pagination.extend({
  status: z.enum(['menunggu', 'diverifikasi', 'dikoordinasikan', 'diteruskan_instansi', 'selesai', 'ditolak']).optional(),
  category: z.enum(CATEGORIES).optional(),
  mine: z.coerce.boolean().optional(),
  ai_status: z.enum(['pending', 'done', 'fallback']).optional(),
});
```

```http
GET /api/reports?status=menunggu&page=1&limit=20
```

```json
{ "success": true, "data": [ { "id": 41, "title": "…", "status": "menunggu", "category": "sampah",
  "urgency": "sedang", "handling": "komunitas", "hazard_flags": [], "ai_status": "done",
  "kelurahan": "Tebet Barat", "kecamatan": "Tebet", "created_at": "…", "thumbnail_url": "/api/files/report-photos/90",
  "duplicate_candidates": 1, "is_synthetic": true } ],
  "meta": { "page": 1, "limit": 20, "total": 3 } }
```

**Galat:** 400, 401.

### R3 `GET /reports/public`

- **Peran:** publik · **Sumber:** view `reports_public` · **Efek samping:** tidak ada.

```js
const query = z.object({
  bbox: z.string().regex(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/, 'bbox = minLng,minLat,maxLng,maxLat').optional(),
  // satu atau beberapa status dipisah koma, mis. ?status=diverifikasi,dikoordinasikan,diteruskan_instansi
  status: z.string().transform((s) => s.split(',')).pipe(z.array(z.enum(['menunggu', 'diverifikasi', 'dikoordinasikan', 'diteruskan_instansi', 'selesai'])).min(1)).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(500),
});
```

```http
GET /api/reports/public?bbox=106.83,-6.25,106.87,-6.21
```

Respons: `data: ReportPublicDTO[]` (tanpa `meta`). **Galat:** 400.

### R4 `GET /reports/:id`

- **Peran:** pelapor, moderator(W), instansi(W) (hanya bila ada rujukan), koordinator(K)/anggota(K) dari komunitas yang punya match diusulkan/diterima atau aksi, admin.
- **Efek samping:** tidak ada.

```js
const params = idParams;
```

Respons: `ReportDTO` + `history[]` (`report_status_history`, `changed_by` ditampilkan sebagai peran, bukan nama) + `action` ringkas (`{ id, status, community_name }` atau null) + `referral` ringkas (`{ id, status, origin }` atau null).

```json
{ "success": true, "data": { "id": 41, "status": "diverifikasi", "…": "…",
  "history": [ { "from_status": null, "to_status": "menunggu", "event": "create", "by_role": "warga", "reason": null, "created_at": "…" },
               { "from_status": "menunggu", "to_status": "diverifikasi", "event": "verify", "by_role": "moderator", "reason": null, "created_at": "…" } ],
  "action": null, "referral": null } }
```

**Galat:** 401; 404 (termasuk tidak berhak melihat).

### R5 `POST /reports/:id/verify`

- **Peran:** moderator(W) (bukan pelapor laporan itu → `SELF_VERIFICATION`) · **AI:** tidak (matching = algoritma). Jika `handling='campuran'`, `aiService.run('agency_draft')` dipanggil **di luar transaksi** setelah commit untuk mengisi draf rujukan (rujukan dibuat dulu dengan templat fallback).
- **Efek samping (1 transaksi):** `reports.status='diverifikasi'`, `verified_at`; bila ada `override` → kolom laporan diperbarui + `ai_analyses.human_override/overridden_by/overridden_at`; `report_status_history` (`verify`); `matches` (≤ 3, `matching.rank`); bila `campuran` → `agency_referrals` (`origin='campuran'`, `status='draf'`); `audit_logs` `report.verify`; notifikasi `match_new` ke setiap koordinator komunitas yang di-match + `report_status` ke pelapor.

```js
const body = z.object({
  override: z.object({
    category: z.enum(CATEGORIES).optional(),
    urgency: z.enum(URGENCIES).optional(),
    handling: z.enum(HANDLINGS).optional(),
    hazard_flags: z.array(z.enum(HAZARDS)).max(8).optional(),
    required_skills: z.array(z.enum(SKILLS)).max(7).optional(),
    est_volunteers: z.number().int().min(1).max(100).optional(),
  }).strict().optional(),
  duplicate_of: id.optional(),
});
```

```http
POST /api/reports/41/verify
{ "override": { "urgency": "tinggi" } }
```

```json
{ "success": true, "data": { "report": { "id": 41, "status": "diverifikasi", "urgency": "tinggi" },
  "matches": [ { "id": 501, "community_id": 1, "community_name": "Bank Sampah Melati (sintetis)", "score": 0.963, "rank": 1 },
               { "id": 502, "community_id": 2, "community_name": "Relawan Kampus Hijau (sintetis)", "score": 0.748, "rank": 2 },
               { "id": 503, "community_id": 3, "community_name": "Karang Taruna RW 05 (sintetis)", "score": 0.657, "rank": 3 } ],
  "referral": null } }
```

**Galat:** 403 `FORBIDDEN_SCOPE` / `SELF_VERIFICATION`; 404; 409 `REPORT_INVALID_TRANSITION` (status ≠ menunggu, atau `ai_status='pending'` → pesan "Triase belum selesai"); 409 `HANDLING_MISMATCH` (handling akhir `instansi` atau `hazard_flags` tidak kosong → "Gunakan Teruskan ke instansi"). Jika tidak ada komunitas lolos filter (skor ≥ 0,40), respons tetap 200 dengan `matches: []` dan UI menyarankan meneruskan ke instansi.

### R6 `POST /reports/:id/forward`

- **Peran:** moderator(W) · **AI:** `agency_draft` (sinkron, timeout 10 dtk, fallback templat)
- **Efek samping:** `reports.status='diteruskan_instansi'`; `report_status_history` (`forward`); `agency_referrals` (`origin='instansi'`, `status='draf'`, `agency_id`, `draft_text`, `ai_analysis_id`); `ai_analyses` (`agency_draft`); `audit_logs` `report.forward`; notifikasi `referral_update` ke pelapor dan instansi(W).
- **Asal status:** `menunggu` atau `diverifikasi` (mis. semua komunitas menolak).

```js
const body = z.object({
  agency_id: id,
  override: z.object({ handling: z.literal('instansi').optional(),
                       hazard_flags: z.array(z.enum(HAZARDS)).optional() }).optional(),
  note: text(0, 300, 'Catatan').optional(),
});
```

```http
POST /api/reports/44/forward
{ "agency_id": 1 }
```

```json
{ "success": true, "data": { "report": { "id": 44, "status": "diteruskan_instansi" },
  "referral": { "id": 12, "status": "draf", "origin": "instansi", "agency": { "id": 1, "name": "SP4N-LAPOR!", "channel_url": "https://www.lapor.go.id" },
                "draft_text": "Judul: Trotoar rusak berlubang di Jl. …", "draft_source": "gemini" } } }
```

**Galat:** 403; 404 (laporan atau `agency_id`); 409 `REPORT_INVALID_TRANSITION` (asal bukan `menunggu`/`diverifikasi`); 409 `ALREADY_EXISTS` (laporan `campuran` sudah punya rujukan; jalurnya tetap komunitas, ubah rujukan lewat F3).

### R7 `POST /reports/:id/reject`

- **Peran:** moderator(W) · **Efek samping:** `reports.status='ditolak'`, `reject_reason`, `duplicate_of` (bila duplikat); history (`reject`, `reason` = note); `matches` terbuka → `kedaluwarsa`; audit `report.reject`; notifikasi ke pelapor.

```js
const body = z.object({
  reason_code: z.enum(REJECT_REASONS),
  note: text(5, 300, 'Catatan alasan'),
  duplicate_of: id.optional(),
}).refine((b) => b.reason_code !== 'duplikat' || b.duplicate_of, { message: 'Pilih laporan asli', path: ['duplicate_of'] });
```

```http
POST /api/reports/46/reject
{ "reason_code": "duplikat", "note": "Sama dengan laporan #41", "duplicate_of": 41 }
```

Respons: `{ report: { id, status: "ditolak", reject_reason } }`.
**Galat:** 400; 403; 404; 409 `REPORT_INVALID_TRANSITION` (asal harus `menunggu` atau `diverifikasi`).

### R8 `POST /reports/:id/return`

- **Peran:** moderator(W) · **Arti:** rujukan instansi dikembalikan (mis. kelurahan meminta warga bergotong royong).
- **Efek samping:** status `diteruskan_instansi → diverifikasi`; `reports.handling='komunitas'`; `matching.rank` dijalankan ulang; history (`return`); audit; notifikasi.

```js
const body = z.object({ note: text(5, 300, 'Alasan') });
```

**Galat:** 403; 404; 409 `REPORT_INVALID_TRANSITION`; 409 `HANDLING_MISMATCH` (masih ada `hazard_flags`).

### R9 `POST /reports/:id/reopen`

- **Peran:** admin · **Efek samping:** `ditolak → menunggu`, `reject_reason=NULL`; history (`reopen`); audit; notifikasi ke moderator(W).

```js
const body = z.object({ note: text(5, 300, 'Alasan banding') });
```

**Galat:** 403 `FORBIDDEN_ROLE`; 404; 409 `REPORT_INVALID_TRANSITION`.

### R10 `GET /reports/:id/duplicates` (S03)

- **Peran:** moderator(W) · **Aturan:** kategori sama, jarak ≤ 100 m (haversine), selisih `created_at` ≤ 7 hari, status ≠ `ditolak`, bukan laporan itu sendiri.

```js
const params = idParams;
```

```json
{ "success": true, "data": [ { "id": 39, "title": "Tumpukan sampah dekat musala", "distance_m": 42, "status": "menunggu", "created_at": "…" } ] }
```

**Galat:** 403; 404.

### R11 `GET /reports/:id/matches`

- **Peran:** moderator(W), koordinator(K) dari komunitas yang ada di daftar.

```json
{ "success": true, "data": [ { "id": 501, "rank": 1, "status": "diusulkan", "score": 0.963,
  "community": { "id": 1, "name": "Bank Sampah Melati (sintetis)" },
  "score_detail": { "K": 1, "A": 1, "W": 1, "J": 0.92, "T": 0.75,
                    "weights": { "K": 0.35, "A": 0.2, "W": 0.2, "J": 0.15, "T": 0.1 },
                    "distance_km": 0.8, "available": 6, "needed": 8,
                    "reasons": ["Fokus sampah", "Punya keahlian angkut & pilah", "Satu kelurahan", "0,8 km", "6 dari 8 relawan tersedia"] } } ] }
```

Koordinator hanya menerima baris komunitasnya sendiri. **Galat:** 403; 404.

### R12 `POST /reports/:id/action-plan`

- **Peran:** koordinator(K) dari match yang `diterima` · **AI:** `action_plan` (sinkron, 10 dtk, fallback templat per kategori)
- **Efek samping:** `ai_analyses` (`action_plan`). Tidak membuat aksi.

```js
const body = z.object({ volunteers: z.number().int().min(1).max(100) });
```

```json
{ "success": true, "data": { "ai_analysis_id": 322, "source": "gemini",
  "plan": { "tugas": [ { "judul": "Pengumpulan & pemilahan", "keahlian": "pilah", "relawan": 4, "butuh_rute": false },
                       { "judul": "Angkut ke TPS terdekat", "keahlian": "angkut", "relawan": 2, "butuh_rute": true },
                       { "judul": "Dokumentasi before/after", "keahlian": "dokumentasi", "relawan": 1, "butuh_rute": false } ],
            "alat": ["sarung tangan", "masker", "karung", "gerobak"],
            "catatan_keselamatan": ["Gunakan sarung tangan; jangan memungut benda tajam dengan tangan.",
                                    "Jika ditemukan limbah medis/kimia, hentikan dan laporkan ke moderator."],
            "perkiraan_durasi_jam": 3 } } }
```

**Galat:** 403 `FORBIDDEN_COMMUNITY`; 404; 409 `REPORT_INVALID_TRANSITION` (status ≠ `dikoordinasikan`).

---

## 5. Chat (C1–C4)

### C1 `POST /chat/sessions`

- **Peran:** login · **Efek samping:** `chat_sessions` (mode `lapor`), `chat_messages` (pesan sistem pembuka).

```js
const body = z.object({ mode: z.literal('lapor') });
```

```json
{ "success": true, "data": { "session_id": 88,
  "messages": [ { "sender": "system", "content": "Ceritakan masalah yang kamu lihat. Sebutkan di mana dan sejak kapan, ya." } ] } }
```

### C2 `POST /chat/sessions/:id/messages`

- **Peran:** pemilik sesi (`chat_sessions.user_id`) · **AI:** `chat_extract` dengan riwayat ≤ 10 pesan terakhir · **Rate limit:** AI
- **Efek samping:** `chat_messages` (user + ai), `chat_sessions.last_draft`, `ai_analyses` (`chat_extract`, `report_id` NULL).

```js
const params = idParams;
const body = z.object({ content: text(1, 1000, 'Pesan') });
```

```http
POST /api/chat/sessions/88/messages
{ "content": "Di lahan kosong dekat musala sampah numpuk seminggu, bau dan banyak lalat" }
```

```json
{ "success": true, "data": {
  "reply": "Boleh tandai titik lokasinya di peta dan kirim fotonya?",
  "source": "gemini",
  "draft": { "judul": "Sampah menumpuk di lahan kosong dekat musala", "ringkasan": "…", "kategori": "sampah",
             "lokasi_teks": "Lahan kosong dekat musala", "sejak": "±1 minggu", "urgensi_saran": "sedang" },
  "field_kurang": ["titik_peta", "foto"], "status": "need_more", "redirect_to_form": false } }
```

Jika AI gagal dan fallback tidak dapat mengekstrak kategori: `status="fallback_form"`, `redirect_to_form=true`, `draft.ringkasan` = gabungan pesan pengguna.
**Galat:** 400; 403 (bukan pemilik → 404 `NOT_FOUND`); 409 `ALREADY_EXISTS` (sesi sudah `dikonfirmasi`); 429.

### C3 `POST /chat/sessions/:id/confirm`

- **Peran:** pemilik sesi · **AI:** triase asinkron seperti R1 · **Format:** multipart (`payload` + `photos`)
- **Efek samping:** sama dengan R1 + `chat_sessions.status='dikonfirmasi'`, `report_id`; `reports.source='chat'`.

```js
const payload = z.object({
  title: text(5, 200, 'Judul'),
  description: text(20, 2000, 'Deskripsi'),
  category: z.enum(CATEGORIES),
  location: point,
  address_text: text(3, 300, 'Patokan lokasi').optional(),
  kelurahan: text(2, 100, 'Kelurahan'),
  kecamatan: text(2, 100, 'Kecamatan'),
});
```

Respons dan galat sama dengan R1, ditambah 404 (bukan pemilik) dan 409 `ALREADY_EXISTS`.

### C4 `POST /chat/faq`

- **Peran:** publik · **AI:** `faq` (FAQ disisipkan ke prompt) · **Rate limit:** AI per IP · **Efek samping:** `ai_analyses` (`faq`, tanpa isi pertanyaan bila mengandung email/nomor HP — disensor oleh `redactPII`).

```js
const body = z.object({
  question: text(3, 500, 'Pertanyaan'),
  history: z.array(z.object({ role: z.enum(['user', 'ai']), content: z.string().max(1000) })).max(6).default([]),
});
```

```json
{ "success": true, "data": { "source": "gemini",
  "jawaban": "Laporanmu masih Menunggu karena belum dicek moderator wilayah…",
  "rujukan_faq": ["faq-status-menunggu"], "niat_melapor": false, "di_luar_cakupan": false } }
```

Fallback: pencarian kata kunci atas `backend/src/services/ai/faq.md`, `source="aturan"`.
**Galat:** 400; 429.

---

## 6. Matching (M1–M3)

### M1 `GET /communities/:id/matches`

- **Peran:** koordinator(K) · **Query:** `status` default `diusulkan`.

```js
const params = idParams;
const query = pagination.extend({ status: z.enum(['diusulkan', 'diterima', 'ditolak', 'kedaluwarsa']).default('diusulkan') });
```

Respons: daftar match seperti R11 + ringkasan laporan (`title`, `category`, `urgency`, `kelurahan`, `distance_km`, `thumbnail_url`). Koordinat persis belum diberikan sebelum diterima.
**Galat:** 403 `FORBIDDEN_COMMUNITY`.

### M2 `POST /matches/:id/accept`

- **Peran:** koordinator(K) komunitas match · **Efek samping (1 transaksi):** `matches.status='diterima'`, `decided_by/at`; match lain laporan itu → `kedaluwarsa`; laporan `diverifikasi → dikoordinasikan` (event `match_accept`); history; audit `match.accept`; notifikasi ke pelapor & moderator(W).

```js
const params = idParams;
const body = z.object({}).strict();
```

```json
{ "success": true, "data": { "match": { "id": 501, "status": "diterima" },
  "report": { "id": 41, "status": "dikoordinasikan" }, "next": "/aksi/baru?report=41" } }
```

**Galat:** 403; 404; 409 `REPORT_INVALID_TRANSITION` (laporan bukan `diverifikasi` atau match bukan `diusulkan`).

### M3 `POST /matches/:id/decline`

- **Peran:** koordinator(K) · **Efek samping:** `matches.status='ditolak'`, `decline_reason`; bila semua match `ditolak`, `matching.rank` mengambil peringkat berikutnya (rank 4–6) yang belum pernah diusulkan; notifikasi ke moderator(W) bila tidak ada kandidat tersisa.

```js
const body = z.object({ reason: text(5, 200, 'Alasan') });
```

```json
{ "success": true, "data": { "match": { "id": 502, "status": "ditolak" }, "next_match": { "id": 507, "community_name": "…", "rank": 4 } } }
```

`next_match` bisa `null`. **Galat:** 400; 403; 404; 409.

---

## 7. Aksi & tugas (X1–X7, T1–T6)

### X1 `POST /actions`

- **Peran:** koordinator(K) dari match `diterima` laporan itu · **Efek samping:** `actions` (`direncanakan`, `coordinator_id=req.user.id`, `match_id`), `tasks`, audit `action.create`, notifikasi `task_assigned` untuk tugas yang langsung ditugaskan.

```js
const task = z.object({
  title: text(3, 200, 'Judul tugas'),
  skill: z.enum(SKILLS).optional(),
  quota: z.number().int().min(1).max(50),
  needs_route: z.boolean().default(false),
  assignee_ids: z.array(id).max(50).default([]),
});
const body = z.object({
  report_id: id,
  title: text(5, 200, 'Judul aksi'),
  scheduled_at: z.coerce.date().refine((d) => d > new Date(), 'Jadwal harus di masa depan'),
  meet: point.and(z.object({ label: text(3, 150, 'Nama titik kumpul') })),
  dropoff: point.and(z.object({ label: text(3, 150, 'Nama titik buang') })).optional(),
  volunteers_needed: z.number().int().min(1).max(100),
  tools: z.array(text(2, 60, 'Alat')).max(20).default([]),
  safety_notes: z.array(text(5, 300, 'Catatan keselamatan')).min(1, 'Minimal 1 catatan keselamatan').max(10),
  tasks: z.array(task).min(1, 'Minimal 1 tugas').max(20),
  ai_plan_id: id.optional(),
}).refine((b) => b.tasks.reduce((s, t) => s + t.quota, 0) <= b.volunteers_needed * 2,
  { message: 'Total kuota tugas terlalu besar dibanding kebutuhan relawan', path: ['tasks'] });
```

```http
POST /api/actions
{ "report_id": 41, "title": "Bersih lahan musala", "scheduled_at": "2026-11-08T07:00:00+07:00",
  "meet": { "lat": -6.2305, "lng": 106.8523, "label": "Pos RW 05" },
  "dropoff": { "lat": -6.2350, "lng": 106.8580, "label": "TPS Tebet Barat" },
  "volunteers_needed": 8, "tools": ["sarung tangan", "karung"],
  "safety_notes": ["Gunakan sarung tangan."],
  "tasks": [ { "title": "Angkut ke TPS", "skill": "angkut", "quota": 2, "needs_route": true } ],
  "ai_plan_id": 322 }
```

```json
{ "success": true, "data": { "id": 71, "status": "direncanakan", "tasks": [ { "id": 301, "title": "Angkut ke TPS", "status": "terbuka", "quota": 2, "taken": 0 } ] } }
```

**Galat:** 400; 403 `FORBIDDEN_COMMUNITY`; 404; 409 `REPORT_INVALID_TRANSITION` (laporan bukan `dikoordinasikan`); 409 `ALREADY_EXISTS` (aksi aktif sudah ada, unique index); 422 `OUT_OF_PILOT_AREA`; 400 bila `assignee_ids` bukan anggota komunitas.

### X2 `GET /actions`

- **Peran:** login. `scope=mine` (default): aksi tempat pengguna punya penugasan atau menjadi koordinator; `scope=community&community_id=`: koordinator(K)/anggota(K); moderator: aksi di kecamatannya.

```js
const query = pagination.extend({
  scope: z.enum(['mine', 'community', 'region']).default('mine'),
  community_id: id.optional(),
  status: z.enum(['direncanakan', 'berjalan', 'menunggu_verifikasi', 'terverifikasi', 'dibatalkan']).optional(),
});
```

Respons: `[{ id, title, status, scheduled_at, community_name, report_id, kelurahan, open_tasks, my_task_ids }]` + `meta`.

### X3 `GET /actions/:id`

- **Peran:** anggota(K) & koordinator(K) aksi, pelapor laporan induk (tanpa daftar nama relawan), moderator(W), admin.

```json
{ "success": true, "data": { "id": 71, "title": "Bersih lahan musala", "status": "berjalan",
  "report": { "id": 41, "title": "…", "latitude": -6.23187, "longitude": 106.85412, "category": "sampah" },
  "community": { "id": 1, "name": "Bank Sampah Melati (sintetis)" },
  "scheduled_at": "…", "meet": { "lat": -6.2305, "lng": 106.8523, "label": "Pos RW 05" },
  "dropoff": { "lat": -6.235, "lng": 106.858, "label": "TPS Tebet Barat" },
  "volunteers_needed": 8, "tools": ["…"], "safety_notes": ["…"],
  "tasks": [ { "id": 301, "title": "Angkut ke TPS", "skill": "angkut", "quota": 2, "taken": 1, "status": "terbuka",
               "needs_route": true, "assignees": [ { "id": 12, "name": "Dimas (demo)", "checked_in": true } ], "is_mine": true } ],
  "evidences": [ { "id": 801, "kind": "before", "url": "/api/files/evidences/801", "verify_status": "menunggu", "uploaded_by_role": "anggota" } ],
  "plan_source": "gemini", "can": { "start": false, "submit": true, "cancel": true, "upload_evidence": true, "verify_evidence": false } } }
```

`can` dihitung server agar UI tidak menebak hak. `assignees[].name` hanya untuk anggota(K)/koordinator(K)/admin.

### X4 `PATCH /actions/:id`

- **Peran:** koordinator(K) · **Hanya** saat `direncanakan` · **Efek samping:** `actions` diperbarui, audit `action.update`.

```js
const body = z.object({
  title: text(5, 200, 'Judul aksi').optional(),
  scheduled_at: z.coerce.date().optional(),
  meet: point.and(z.object({ label: text(3, 150, 'Nama titik kumpul') })).optional(),
  dropoff: point.and(z.object({ label: text(3, 150, 'Nama titik buang') })).nullable().optional(),
  volunteers_needed: z.number().int().min(1).max(100).optional(),
  tools: z.array(text(2, 60, 'Alat')).max(20).optional(),
  safety_notes: z.array(text(5, 300, 'Catatan keselamatan')).min(1).max(10).optional(),
});
```

**Galat:** 400; 403; 404; 409 `ACTION_INVALID_TRANSITION`.

### X5 `POST /actions/:id/start`

- **Peran:** koordinator(K) · `direncanakan → berjalan`, `started_at`; audit; notifikasi ke penerima tugas. (Juga terjadi otomatis pada check-in pertama, T5.)
- **Skema:** `idParams`, body `{}`. **Galat:** 403; 404; 409 `ACTION_INVALID_TRANSITION`.

### X6 `POST /actions/:id/submit`

- **Peran:** koordinator(K) · `berjalan → menunggu_verifikasi`, `submitted_at`; syarat ≥ 1 bukti `after` berstatus `menunggu` atau `sah`; notifikasi `evidence_pending` ke moderator(W) dan pelapor.

```js
const body = z.object({
  hours: z.array(z.object({ user_id: id, hours: z.number().min(0).max(24) })).max(100).default([]),
  volume_kg_est: z.number().min(0).max(100000).optional(),
});
```

Efek samping tambahan: `task_assignments.hours`, `evidences.volume_kg_est` pada bukti `after` terbaru.
**Galat:** 403; 404; 409 `ACTION_INVALID_TRANSITION`; 409 `EVIDENCE_REQUIRED`.

### X7 `POST /actions/:id/cancel`

- **Peran:** koordinator(K) · `direncanakan|berjalan → dibatalkan`, `cancel_reason`; laporan `dikoordinasikan → diverifikasi` (event `action_cancelled`, sistem); match terkait → `ditolak` dengan alasan; `matching.rank` dijalankan ulang tanpa komunitas ini; notifikasi ke pelapor, moderator(W), penerima tugas.

```js
const body = z.object({ reason: text(5, 200, 'Alasan pembatalan') });
```

**Galat:** 400; 403; 404; 409 `ACTION_INVALID_TRANSITION`.

### T1 `POST /actions/:id/tasks`

- **Peran:** koordinator(K), aksi `direncanakan|berjalan` · **Efek samping:** `tasks`, audit.
- **Skema:** `task` dari X1 (satu objek). Respons: tugas baru. **Galat:** 400; 403; 404; 409.

### T2 `POST /tasks/:id/claim`

- **Peran:** anggota(K) komunitas aksi · aksi `direncanakan|berjalan` · tugas `terbuka`
- **Efek samping (1 transaksi, `SELECT … FOR UPDATE` pada `tasks`):** `task_assignments` (`assigned_by NULL`); bila jumlah = `quota` → `tasks.status='diambil'`; audit `task.claim`; notifikasi ke koordinator.
- **Skema:** `idParams`, body `{}`.

```json
{ "success": true, "data": { "task": { "id": 301, "status": "diambil", "taken": 2, "quota": 2, "is_mine": true } } }
```

**Galat:** 403 `FORBIDDEN_COMMUNITY`; 404; 409 `TASK_QUOTA_FULL`; 409 `ALREADY_EXISTS` (sudah mengambil).

### T3 `POST /tasks/:id/release`

- **Peran:** anggota(K) yang ditugaskan, sebelum check-in · **Efek samping:** hapus `task_assignments`; `diambil → terbuka`; audit.
- **Galat:** 403; 404; 409 `ACTION_INVALID_TRANSITION` (sudah check-in atau tugas `selesai`).

### T4 `POST /tasks/:id/assign`

- **Peran:** koordinator(K) · **Efek samping:** seperti T2 dengan `assigned_by=req.user.id`; notifikasi `task_assigned` ke relawan.

```js
const body = z.object({ user_id: id });
```

**Galat:** 400 (bukan anggota komunitas); 403; 404; 409 `TASK_QUOTA_FULL` / `ALREADY_EXISTS`.

### T5 `POST /tasks/:id/checkin`

- **Peran:** anggota(K) yang ditugaskan · **Efek samping:** `checked_in_at=now()`; bila aksi `direncanakan` → `berjalan` (sistem). Lokasi relawan **tidak** dikirim dan tidak disimpan.
- **Skema:** `idParams`, body `{}`. **Galat:** 403; 404; 409 (aksi bukan `direncanakan|berjalan`).

### T6 `POST /tasks/:id/complete`

- **Peran:** anggota(K) yang ditugaskan atau koordinator(K) · `terbuka|diambil → selesai`.

```js
const body = z.object({ hours: z.number().min(0).max(24).optional() });
```

**Galat:** 403; 404; 409 `ACTION_INVALID_TRANSITION` (aksi bukan `berjalan`).

---

## 8. Bukti (E1–E4)

### E1 `POST /actions/:id/evidences`

- **Peran:** anggota(K) yang punya penugasan di aksi, atau koordinator(K) · aksi `berjalan` (before boleh juga saat `direncanakan`)
- **Format:** multipart `payload` + `photo` (1 file) · **Efek samping:** file WebP tanpa EXIF di `UPLOAD_DIR/evidences/`; `evidences` (`verify_status='menunggu'`); audit `evidence.upload`.

```js
const payload = z.object({
  kind: z.enum(['before', 'after']),
  note: text(0, 500, 'Catatan').optional(),
  use_report_photo_id: id.optional(), // "before" boleh memakai foto laporan, tanpa unggah file
}).refine((p) => p.kind === 'before' || !p.use_report_photo_id, 'Foto laporan hanya untuk before');
```

```json
{ "success": true, "data": { "id": 802, "kind": "after", "verify_status": "menunggu", "url": "/api/files/evidences/802" } }
```

**Galat:** 400 (tidak ada file dan tidak ada `use_report_photo_id`); 403; 404; 409 `ACTION_INVALID_TRANSITION`; 413; 415.

### E2 `POST /referrals/:id/evidences`

- **Peran:** moderator(W), instansi(W), pelapor · rujukan `terkirim|ditindaklanjuti` · Skema dan respons sama dengan E1 (tanpa `use_report_photo_id`).
- **Galat:** sama dengan E1.

### E3 `POST /evidences/:id/verify`

- **Peran:** moderator(W) atau pelapor laporan induk; **bukan** pengunggah (`SELF_VERIFICATION`; juga `CHECK` di DB).
- **Efek samping (1 transaksi):** `evidences.verify_status/verified_by/verified_at/verify_reason`; jika `sah` dan `kind='after'`:
  - bukti aksi + aksi `menunggu_verifikasi` → aksi `terverifikasi`, `completed_at` → laporan `dikoordinasikan → selesai` (event `action_verified`), `resolved_at`;
  - bukti rujukan → **tidak** mengubah status (selesai via F4).
  Jika `ditolak` dan aksi `menunggu_verifikasi` → aksi kembali `berjalan`. Audit `evidence.verify`; notifikasi `evidence_result` ke pengunggah & koordinator.

```js
const body = z.object({
  decision: z.enum(['sah', 'ditolak']),
  reason: text(5, 300, 'Alasan').optional(),
}).refine((b) => b.decision === 'sah' || b.reason, { message: 'Alasan wajib bila ditolak', path: ['reason'] });
```

```json
{ "success": true, "data": { "evidence": { "id": 802, "verify_status": "sah" },
  "action": { "id": 71, "status": "terverifikasi" }, "report": { "id": 41, "status": "selesai" } } }
```

**Galat:** 400; 403 `SELF_VERIFICATION` / `FORBIDDEN_SCOPE`; 404; 409 `ACTION_INVALID_TRANSITION` (bukti sudah diputuskan).

### E4 `GET /evidences/pending`

- **Peran:** moderator → bukti `menunggu` di kecamatannya; warga → bukti `after` untuk laporannya.
- **Skema:** `pagination`. Respons: `[{ id, kind, url, action_id, referral_id, report_id, report_title, uploaded_at, before_url }]`.

---

## 9. Rujukan instansi (F1–F4)

### F1 `GET /referrals`

```js
const query = pagination.extend({
  status: z.enum(['draf', 'terkirim', 'ditindaklanjuti']).optional(),
  origin: z.enum(['instansi', 'campuran']).optional(),
});
```

Moderator/instansi hanya kecamatannya. Respons: `[{ id, report_id, report_title, origin, status, agency_name, external_ticket, updated_at }]`.

### F2 `GET /referrals/:id`

```json
{ "success": true, "data": { "id": 12, "origin": "instansi", "status": "draf",
  "agency": { "id": 1, "name": "SP4N-LAPOR!", "channel_url": "https://www.lapor.go.id", "notes": "Kanal pengaduan pelayanan publik nasional." },
  "draft_text": "…", "draft_source": "gemini", "external_ticket": null, "followup_note": null,
  "report": { "id": 44, "title": "Trotoar rusak …", "latitude": -6.2290, "longitude": 106.8470, "photos": ["/api/files/report-photos/95"] },
  "evidences": [], "disclaimer": "SUSI Connect tidak terhubung langsung ke instansi. Kirim lewat kanal resmi di atas." } }
```

### F3 `PATCH /referrals/:id`

- **Peran:** moderator(W), instansi(W); pelapor hanya boleh `status='terkirim'` + `external_ticket`.
- **Efek samping:** `agency_referrals` diperbarui; `sent_by/sent_at` saat menjadi `terkirim`; audit; notifikasi `referral_update`.

```js
const body = z.object({
  draft_text: text(50, 5000, 'Draf laporan').optional(),
  status: z.enum(['terkirim', 'ditindaklanjuti']).optional(),
  external_ticket: text(1, 100, 'Nomor tiket').optional(),
  followup_note: text(0, 1000, 'Catatan tindak lanjut').optional(),
});
```

Urutan status hanya maju: `draf → terkirim → ditindaklanjuti`. **Galat:** 400; 403; 404; 409 `REPORT_INVALID_TRANSITION`.

### F4 `POST /referrals/:id/complete`

- **Peran:** moderator(W), instansi(W) · Hanya `origin='instansi'` · Syarat: ≥ 1 bukti `after` rujukan berstatus `sah` (diverifikasi oleh pelapor atau moderator lain, E3).
- **Efek samping:** laporan `diteruskan_instansi → selesai` (event `agency_done`), `resolved_at`; `agency_referrals.status='ditindaklanjuti'`; audit; notifikasi ke pelapor.
- **Skema:** body `{ note?: text(0,300) }`. **Galat:** 403; 404; 409 `EVIDENCE_REQUIRED`; 409 `REPORT_INVALID_TRANSITION` (rujukan `campuran` → status laporan mengikuti jalur komunitas).

---

## 10. Hambatan & rute (O1–O4, P1–P2)

### O1 `GET /obstacles`

```js
const query = z.object({
  bbox: z.string().regex(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/).optional(),
  include: z.enum(['active', 'pending', 'all']).default('active'),
});
```

`active` = `status='aktif' AND expires_at > now()`; `pending` = `menunggu_konfirmasi`; `all` hanya moderator/admin.

```json
{ "success": true, "data": [ { "id": 5, "type": "perbaikan_jalan", "latitude": -6.2331, "longitude": 106.8551, "radius_m": 60,
  "status": "aktif", "expires_at": "2026-11-14T23:59:00+07:00", "is_expired": false, "source_role": "instansi",
  "description": "Galian saluran (sintetis)", "confirmations": { "yes": 0, "no": 0 },
  "polygon": { "type": "Polygon", "coordinates": [[[106.8556, -6.2331], "… 16 titik …"]] } } ] }
```

### O2 `POST /obstacles`

- **Peran:** koordinator komunitas mana pun, moderator, instansi, admin → `status='aktif'`. (S01) warga/relawan lain → `menunggu_konfirmasi`.
- **Efek samping:** `road_obstacles` (`source_role` dihitung server); audit `obstacle.create`; cache rute otomatis tidak terpakai (kunci memuat id hambatan).

```js
const body = z.object({
  type: z.enum(OBSTACLE_TYPES),
  location: point,
  radius_m: z.number().int().min(10).max(500).default(50),
  description: text(0, 300, 'Keterangan').optional(),
  expires_at: z.coerce.date()
    .refine((d) => d > new Date(), 'Masa berlaku harus di masa depan')
    .refine((d) => d < new Date(Date.now() + 30 * 864e5), 'Maksimal 30 hari'),
});
```

Default UI: `demo`/`kegiatan_warga` +24 jam; `perbaikan_jalan`/`banjir`/`pohon_tumbang`/`lainnya` +7 hari [ASUMSI].
**Galat:** 400; 401; 422 `OUT_OF_PILOT_AREA`.

### O3 `POST /obstacles/:id/confirm` (S01)

- **Peran:** login, bukan pembuat · **Efek samping:** `obstacle_confirmations`; 2 × `still_there=true` → `aktif`; 2 × `false` → `dicabut`; notifikasi `obstacle_confirm` ke pembuat.

```js
const body = z.object({ still_there: z.boolean() });
```

**Galat:** 403 (pembuat sendiri → `SELF_VERIFICATION`); 404; 409 `ALREADY_EXISTS`.

### O4 `POST /obstacles/:id/revoke`

- **Peran:** pembuat, moderator, admin · **Efek samping:** `status='dicabut'`, `revoked_by`; audit.
- **Skema:** body `{ reason?: text(0,200) }`. **Galat:** 403; 404; 409 (sudah dicabut).

### P1 `GET /routes`

- **Peran:** koordinator(K) atau anggota(K) **dari aksi yang dirujuk** `action_id` (mencegah pemakaian ORS sebagai layanan umum).
- **ORS:** ya, kecuali cache hit atau `ROUTING_MODE≠live` · **Efek samping:** `route_cache` (miss → insert, TTL 24 jam atau sampai hambatan berubah).

```js
const query = z.object({
  action_id: id,
  from: z.string().regex(/^-?\d+\.\d+,-?\d+\.\d+$/, 'from = lat,lng'),
  to: z.enum(['location', 'dropoff']).default('location'),
  via: z.enum(['none', 'location']).default('none'),
  profile: z.enum(PROFILES).default('driving-car'),
});
```

`from` adalah titik yang dipilih relawan (GPS browser atau titik kumpul); tidak disimpan. `to=location` = koordinat laporan; `to=dropoff` dengan `via=location` = rute titik → lokasi → TPS.

```http
GET /api/routes?action_id=71&from=-6.2305,106.8523&to=dropoff&via=location&profile=driving-car
```

```json
{ "success": true, "data": { "source": "ors", "profile": "driving-car", "distance_m": 1840, "duration_s": 420,
  "is_estimate": true, "avoided": [5],
  "geometry": { "type": "LineString", "coordinates": [[106.8523, -6.2305], "…", [106.858, -6.235]] },
  "notice": null } }
```

Fallback: `source="cache"` (mode cache) atau `source="straight"` dengan `notice = "Rute garis lurus — layanan rute tidak tersedia. Jarak dihitung lurus, bukan jalan."`.
**Galat:** 400; 403 `FORBIDDEN_COMMUNITY`; 404; 422 `OUT_OF_PILOT_AREA`; 502 `UPSTREAM_FAILED` hanya bila `ROUTING_MODE=cache` dan cache kosong **dan** fallback garis lurus dimatikan (`ROUTING_ALLOW_STRAIGHT=false`).

### P2 `GET /routes/compare` (S02)

- Sama dengan P1 tanpa `profile`; memanggil ketiga profil (paralel, berbagi cache).

```json
{ "success": true, "data": { "options": [
  { "profile": "foot-walking", "label": "Jalan kaki", "distance_m": 1650, "duration_s": 1260, "cost_idr_est": 0, "source": "ors" },
  { "profile": "cycling-regular", "label": "Sepeda", "distance_m": 1720, "duration_s": 480, "cost_idr_est": 0, "source": "ors" },
  { "profile": "driving-car", "label": "Motor/mobil", "distance_m": 1840, "duration_s": 420, "cost_idr_est": null, "source": "ors" } ],
  "assumptions": "Durasi dari OpenRouteService, belum memperhitungkan macet. Biaya kendaraan belum dihitung [PERLU DATA]." } }
```

`cost_idr_est` kendaraan = `null` sampai tim menetapkan rumus biaya dengan sumber [PERLU DATA].

---

## 11. Metrik (K1)

### K1 `GET /metrics/impact`

- **Peran:** publik → hanya `reports_total`, `resolution_rate`, `volunteer_hours`, `waste_kg_est`; login → semua metrik PRD §10; koordinator boleh `community_id` komunitasnya; moderator/instansi dipaksa `kecamatan = scope_kecamatan`.

```js
const query = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  kecamatan: text(2, 100, 'Kecamatan').optional(),
  community_id: id.optional(),
  include_synthetic: z.coerce.boolean().default(true),
});
```

```json
{ "success": true, "data": { "filters": { "kecamatan": "Tebet", "from": null, "to": null },
  "is_synthetic_share": 1.0,
  "metrics": [
    { "key": "reports_total", "label": "Laporan masuk", "value": 12, "unit": "laporan", "formula": "Jumlah laporan pada rentang waktu" },
    { "key": "resolution_rate", "label": "Tingkat penyelesaian", "value": 0.42, "unit": "rasio", "formula": "Laporan selesai ÷ (laporan masuk − ditolak)" } ],
  "breakdown": { "reports_by_status": { "menunggu": 3, "diverifikasi": 2, "dikoordinasikan": 3, "diteruskan_instansi": 1, "selesai": 4, "ditolak": 1 },
                 "actions_by_status": { "direncanakan": 1, "berjalan": 1, "menunggu_verifikasi": 1, "terverifikasi": 4, "dibatalkan": 0 },
                 "open_tasks": 4 } } }
```

`breakdown` selalu dikirim (juga ke publik: hanya hitungan) untuk kartu dashboard. Daftar `key` lengkap dan SQL-nya: SDD §6.6. **Galat:** 400; 403 `FORBIDDEN_COMMUNITY`.

---

## 12. Komunitas & kanal instansi (G1–G6, H1–H3)

### G1 `GET /communities`

```js
const query = pagination.extend({ category: z.enum([...CATEGORIES, 'umum']).optional(), kecamatan: z.string().optional() });
```

Respons: `[{ id, name, description, categories, skills, kecamatan, coverage_kelurahan, member_count, is_synthetic }]` (tanpa koordinat markas persis; `base` dibulatkan 3 desimal).

### G2 `GET /communities/:id`

Respons G1 + `contact_public`, `actions_verified`, `volunteer_hours` (metrik komunitas). Anggota hanya ditampilkan ke koordinator(K)/admin: `members: [{ user_id, name, member_role, is_available }]`.

### G3 `POST /communities` (admin)

```js
const body = z.object({
  name: text(3, 150, 'Nama komunitas'),
  description: text(0, 1000, 'Deskripsi').optional(),
  categories: z.array(z.enum([...CATEGORIES, 'umum'])).min(1).max(7),
  skills: z.array(z.enum(SKILLS)).max(7).default([]),
  coverage_kelurahan: z.array(text(2, 100, 'Kelurahan')).max(30).default([]),
  kecamatan: text(2, 100, 'Kecamatan'),
  base: point,
  contact_public: text(0, 150, 'Kontak').optional(),
  coordinator_user_id: id,
});
```

Efek samping: `communities` + `community_members` (koordinator); audit. **Galat:** 400; 403; 404 (user).

### G4 `PATCH /communities/:id`

Skema G3 tanpa `coordinator_user_id`, semua opsional, + `is_active` (admin saja). **Galat:** 400; 403; 404.

### G5 `POST /communities/:id/members`

```js
const body = z.object({ email: z.string().email(), member_role: z.enum(['anggota', 'koordinator']).default('anggota') });
```

Hanya admin boleh menambah `koordinator`. Pengguna harus `role='warga'`. **Galat:** 400 ("Hanya akun warga yang bisa menjadi anggota"); 403; 404 (email); 409 `ALREADY_EXISTS`.

### G6 `DELETE /communities/:id/members/:userId`

Tidak boleh menghapus koordinator terakhir (409 `ACTION_INVALID_TRANSITION`) atau anggota yang punya penugasan di aksi `berjalan` (409).

### H1 `GET /agencies`

```js
const query = z.object({ category: z.enum(CATEGORIES).optional(), kecamatan: z.string().optional() });
```

Urutan: kanal kecamatan cocok dulu, lalu nasional. Respons: `[{ id, name, channel_url, categories, kecamatan, notes }]`.

### H2 `POST /agencies` · H3 `PATCH /agencies/:id` (admin)

```js
const body = z.object({
  name: text(3, 150, 'Nama kanal'),
  channel_url: z.string().url('URL tidak valid').startsWith('https://', 'Harus https'),
  categories: z.array(z.enum(CATEGORIES)).min(1),
  kecamatan: text(2, 100, 'Kecamatan').nullable().default(null),
  notes: text(0, 500, 'Catatan').optional(),
});
```

PATCH: semua field opsional. **Galat:** 400; 403; 404.

---

## 13. Notifikasi (N1–N3)

| ID | Skema | Respons | Efek samping |
| --- | --- | --- | --- |
| N1 `GET /notifications` | `pagination.extend({ unread: z.coerce.boolean().optional() })` | `[{ id, type, title, body, entity, entity_id, link, read_at, created_at }]` + `meta.unread` | — |
| N2 `POST /notifications/:id/read` | `idParams` | `{ id, read_at }` | `read_at=now()`; 404 bila bukan milik |
| N3 `POST /notifications/read-all` | `{}` | `{ updated: 4 }` | semua `read_at` NULL milik pengguna |

`link` dihitung server dari `entity` (`report` → `/laporan/:id`, `action` → `/aksi/:id`, `referral` → `/rujukan/:id`, `match` → `/komunitas/:cid/rekomendasi`, `evidence` → halaman induk). Frontend polling N1 `?unread=true&limit=1` tiap 60 dtk (Green IT).

---

## 14. Admin (U1–U4)

```js
// U1 GET /admin/users
const listQuery = pagination.extend({ role: z.enum(['warga', 'moderator', 'instansi', 'admin']).optional(), q: z.string().max(100).optional() });
// U2 POST /admin/users
const createBody = z.object({
  name: text(2, 100, 'Nama'),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  role: z.enum(['warga', 'moderator', 'instansi', 'admin']),
  scope_kecamatan: text(2, 100, 'Kecamatan').optional(),
}).refine((b) => !['moderator', 'instansi'].includes(b.role) || b.scope_kecamatan,
  { message: 'Moderator/instansi wajib punya kecamatan', path: ['scope_kecamatan'] });
// U3 PATCH /admin/users/:id — semua field createBody opsional kecuali email
// U4 GET /admin/ai-logs
const aiLogQuery = pagination.extend({
  purpose: z.enum(['chat_extract', 'triage', 'action_plan', 'agency_draft', 'faq', 'photo_check']).optional(),
  provider: z.enum(['gemini', 'aturan', 'cache']).optional(),
});
```

U4 respons: `[{ id, purpose, provider, model, status, tokens_in, tokens_out, latency_ms, overridden: true, created_at, report_id }]` (tanpa `output_json`; detail keluaran AI dilihat lewat laporan terkait, R4).
**Galat:** 400; 403 `FORBIDDEN_ROLE`; 409 `ALREADY_EXISTS` (email). Efek samping U2/U3: `users`, audit `user.create`/`user.update`; kata sandi di-hash bcrypt cost 10.

---

## 15. Utilitas (Z1–Z4)

### Z1 `GET /health`

```json
{ "success": true, "data": { "status": "ok", "db": "ok", "ai_mode": "live", "routing_mode": "cache", "demo_mode": true, "version": "1.0.0" } }
```

Frontend memakai `ai_mode`/`routing_mode` untuk banner "Mode cadangan".

### Z2 `GET /files/report-photos/:id` · `GET /files/evidences/:id`

- Token boleh lewat header **atau** `?token=` (karena `<img>` tidak bisa mengirim header). `?token=` **hanya** diterima di `/files/*`; endpoint lain menolaknya (401) [ASUMSI: cukup untuk localhost MVP].
- Hak: sama dengan R4 (foto laporan) / X3 (bukti). Respons: `image/webp`, `Cache-Control: private, max-age=3600`.
- **Galat:** 401; 404.

### Z3 `GET /areas`

```js
const query = z.object({ kecamatan: z.string().optional() });
```

Respons: `[{ kota, kecamatan, kelurahan, center_lat, center_lng }]`.

### Z4 `GET /categories`

Respons: isi tabel `report_categories` urut `sort_order`.
