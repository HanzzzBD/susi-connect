-- =====================================================================
-- 001_core.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.0
-- Isi     : areas, report_categories, users, communities,
--           community_members, agencies
-- Catatan : Dijalankan oleh backend/src/db/migrate.js di dalam satu
--           transaksi per file. Jangan menambah BEGIN/COMMIT di sini.
-- Log Perubahan (dari skema PRD v1 §13 + SDD v1 §7):
--   * users.role hanya warga/moderator/instansi/admin (SDD D2);
--     relawan & koordinator pindah ke community_members.
--   * users.scope_kecamatan ditambahkan (moderator/instansi per kecamatan).
--   * users.is_demo ditambahkan untuk POST /auth/demo-login.
--   * Tabel areas & report_categories baru (wilayah pilot DKI + label UI).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Wilayah administratif (pilot: Provinsi DKI Jakarta)
-- ---------------------------------------------------------------------
CREATE TABLE areas (
  id          SERIAL PRIMARY KEY,
  kota        VARCHAR(60)  NOT NULL,
  kecamatan   VARCHAR(100) NOT NULL,
  kelurahan   VARCHAR(100) NOT NULL,
  center_lat  DOUBLE PRECISION,
  center_lng  DOUBLE PRECISION,
  UNIQUE (kecamatan, kelurahan)
);
COMMENT ON TABLE  areas IS 'Daftar kelurahan DKI Jakarta. Seed MVP hanya memuat kecamatan demo; daftar lengkap [PERLU DATA].';
COMMENT ON COLUMN areas.kota IS 'Kota/kabupaten administrasi, mis. Jakarta Selatan.';
CREATE INDEX idx_areas_kecamatan ON areas(kecamatan);

-- ---------------------------------------------------------------------
-- Kategori laporan (data enum + label UI + penanganan default)
-- ---------------------------------------------------------------------
CREATE TABLE report_categories (
  code             VARCHAR(30) PRIMARY KEY,
  label            VARCHAR(60) NOT NULL,
  default_handling VARCHAR(12) NOT NULL
                   CHECK (default_handling IN ('komunitas','instansi','campuran')),
  sort_order       SMALLINT NOT NULL
);
COMMENT ON TABLE report_categories IS 'Nilai teknis kategori laporan. Dipakai validasi zod, fallback triase, dan label UI.';

INSERT INTO report_categories (code, label, default_handling, sort_order) VALUES
  ('sampah',          'Sampah',                    'komunitas', 1),
  ('drainase',        'Saluran air / drainase',    'campuran',  2),
  ('jalan_trotoar',   'Jalan & trotoar',           'instansi',  3),
  ('penerangan',      'Penerangan jalan',          'instansi',  4),
  ('fasilitas_umum',  'Fasilitas umum',            'campuran',  5),
  ('lingkungan_lain', 'Lingkungan lainnya',        'komunitas', 6),
  ('sosial',          'Bantuan sosial warga',      'komunitas', 7);

-- ---------------------------------------------------------------------
-- Pengguna (peran global)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'warga'
                  CHECK (role IN ('warga','moderator','instansi','admin')),
  scope_kecamatan VARCHAR(100),
  kelurahan       VARCHAR(100),
  kecamatan       VARCHAR(100),
  is_available    BOOLEAN NOT NULL DEFAULT false,
  is_demo         BOOLEAN NOT NULL DEFAULT false,
  is_synthetic    BOOLEAN NOT NULL DEFAULT false,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (role NOT IN ('moderator','instansi') OR scope_kecamatan IS NOT NULL)
);
COMMENT ON COLUMN users.role            IS 'Peran global. Relawan/koordinator BUKAN nilai di sini; lihat community_members.';
COMMENT ON COLUMN users.scope_kecamatan IS 'Wajib untuk moderator & instansi; NULL untuk warga & admin (admin = semua wilayah).';
COMMENT ON COLUMN users.is_available    IS 'Relawan menandai siap ikut aksi; dipakai komponen T (ketersediaan) matching.';
COMMENT ON COLUMN users.is_demo         IS 'Hanya akun is_demo yang boleh dipakai POST /auth/demo-login (DEMO_MODE=true).';
COMMENT ON COLUMN users.is_synthetic    IS 'true = data sintetis seed; dihapus & dibuat ulang oleh npm run seed.';
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- Komunitas penangan
-- ---------------------------------------------------------------------
CREATE TABLE communities (
  id                 BIGSERIAL PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  description        TEXT,
  categories         TEXT[] NOT NULL CHECK (cardinality(categories) >= 1),
  skills             TEXT[] NOT NULL DEFAULT '{}',
  coverage_kelurahan TEXT[] NOT NULL DEFAULT '{}',
  kecamatan          VARCHAR(100) NOT NULL,
  base_lat           DOUBLE PRECISION NOT NULL CHECK (base_lat BETWEEN -90 AND 90),
  base_lng           DOUBLE PRECISION NOT NULL CHECK (base_lng BETWEEN -180 AND 180),
  contact_public     VARCHAR(150),
  is_active          BOOLEAN NOT NULL DEFAULT true,
  is_synthetic       BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN communities.categories IS 'Kode report_categories, atau {umum} untuk komunitas generalis (K = 0,5).';
COMMENT ON COLUMN communities.skills     IS 'Kosakata keahlian: angkut, pilah, dokumentasi, bersih_saluran, logistik, pendampingan, perbaikan_ringan.';
COMMENT ON COLUMN communities.coverage_kelurahan IS 'Kelurahan yang dilayani; W = 1 bila kelurahan laporan ada di sini.';
CREATE INDEX idx_communities_active ON communities(is_active);

CREATE TABLE community_members (
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_role  VARCHAR(20) NOT NULL CHECK (member_role IN ('koordinator','anggota')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);
COMMENT ON TABLE community_members IS 'Peran per komunitas. Relawan = user dengan baris apa pun di sini; koordinator = member_role koordinator.';
CREATE INDEX idx_members_user ON community_members(user_id);

-- ---------------------------------------------------------------------
-- Kanal resmi instansi (BUKAN integrasi; hanya tautan & panduan)
-- ---------------------------------------------------------------------
CREATE TABLE agencies (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  channel_url TEXT NOT NULL,
  categories  TEXT[] NOT NULL,
  kecamatan   VARCHAR(100),
  notes       TEXT,
  is_synthetic BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON COLUMN agencies.kecamatan IS 'NULL = kanal nasional/provinsi (mis. SP4N-LAPOR!).';
