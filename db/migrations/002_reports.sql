-- =====================================================================
-- 002_reports.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.0
-- Isi     : reports, report_photos, report_status_history, ai_analyses,
--           chat_sessions, chat_messages, view reports_public
-- Log Perubahan:
--   * reports.ai_status (pending/done/fallback) digabung dari SDD v1 §7.
--   * reports.category menjadi FK ke report_categories.
--   * ai_analyses.input_hash untuk cache AI (seed/ai-cache).
--   * reports.title boleh dibuat server dari 60 karakter awal deskripsi.
--   * View reports_public dipindah ke sini (sebelumnya ALTER di SDD §7).
-- =====================================================================

CREATE TABLE reports (
  id              BIGSERIAL PRIMARY KEY,
  reporter_id     BIGINT NOT NULL REFERENCES users(id),
  title           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 2000),
  category        VARCHAR(30) NOT NULL REFERENCES report_categories(code),
  urgency         VARCHAR(10) CHECK (urgency IN ('rendah','sedang','tinggi','darurat')),
  handling        VARCHAR(12) CHECK (handling IN ('komunitas','instansi','campuran')),
  hazard_flags    TEXT[] NOT NULL DEFAULT '{}',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  est_volunteers  SMALLINT CHECK (est_volunteers BETWEEN 1 AND 100),
  latitude        DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude       DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  address_text    VARCHAR(300),
  kelurahan       VARCHAR(100) NOT NULL,
  kecamatan       VARCHAR(100) NOT NULL,
  status          VARCHAR(25) NOT NULL DEFAULT 'menunggu'
                  CHECK (status IN ('menunggu','diverifikasi','dikoordinasikan',
                                    'diteruskan_instansi','selesai','ditolak')),
  ai_status       VARCHAR(10) NOT NULL DEFAULT 'pending'
                  CHECK (ai_status IN ('pending','done','fallback')),
  source          VARCHAR(10) NOT NULL CHECK (source IN ('form','chat')),
  duplicate_of    BIGINT REFERENCES reports(id),
  reject_reason   VARCHAR(30) CHECK (reject_reason IN
                  ('palsu','duplikat','di_luar_cakupan','data_kurang','lainnya')),
  is_synthetic    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at     TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status <> 'ditolak' OR reject_reason IS NOT NULL),
  CHECK (status <> 'selesai' OR resolved_at IS NOT NULL)
);
COMMENT ON COLUMN reports.handling     IS 'Hasil triase (AI/aturan, dapat dikoreksi moderator). NULL selama ai_status=pending.';
COMMENT ON COLUMN reports.hazard_flags IS 'Kode penanda bahaya. Tidak kosong => handling dipaksa instansi oleh applyHardRules.';
COMMENT ON COLUMN reports.ai_status    IS 'pending = triase belum selesai; done = Gemini; fallback = aturan kata kunci.';
COMMENT ON COLUMN reports.latitude     IS 'Koordinat persis. Publik hanya melihat reports_public (dibulatkan 3 desimal).';
CREATE INDEX idx_reports_status    ON reports(status);
CREATE INDEX idx_reports_kecamatan ON reports(kecamatan, status);
CREATE INDEX idx_reports_reporter  ON reports(reporter_id);
CREATE INDEX idx_reports_geo       ON reports(latitude, longitude);
CREATE INDEX idx_reports_created   ON reports(created_at);

CREATE TABLE report_photos (
  id          BIGSERIAL PRIMARY KEY,
  report_id   BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  width       INT,
  height      INT,
  is_blurred  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN report_photos.file_path IS 'Relatif terhadap UPLOAD_DIR, nama acak UUID.webp; EXIF sudah dibuang oleh photo.service.';
CREATE INDEX idx_report_photos_report ON report_photos(report_id);

CREATE TABLE report_status_history (
  id          BIGSERIAL PRIMARY KEY,
  report_id   BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  from_status VARCHAR(25),
  to_status   VARCHAR(25) NOT NULL,
  event       VARCHAR(30) NOT NULL,
  changed_by  BIGINT REFERENCES users(id),
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN report_status_history.event      IS 'Event state machine: create, verify, forward, reject, match_accept, action_cancelled, action_verified, agency_done, return, reopen.';
COMMENT ON COLUMN report_status_history.changed_by IS 'NULL = sistem.';
CREATE INDEX idx_rsh_report ON report_status_history(report_id, created_at);

CREATE TABLE ai_analyses (
  id             BIGSERIAL PRIMARY KEY,
  report_id      BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  purpose        VARCHAR(20) NOT NULL CHECK (purpose IN
                 ('chat_extract','triage','action_plan','agency_draft','faq','photo_check')),
  provider       VARCHAR(20) NOT NULL CHECK (provider IN ('gemini','aturan','cache')),
  model          VARCHAR(60),
  input_hash     CHAR(64),
  output_json    JSONB,
  human_override JSONB,
  overridden_by  BIGINT REFERENCES users(id),
  overridden_at  TIMESTAMPTZ,
  tokens_in      INT,
  tokens_out     INT,
  latency_ms     INT,
  status         VARCHAR(10) NOT NULL CHECK (status IN ('ok','invalid','timeout','error')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  ai_analyses IS 'Log semua panggilan AI + transparansi. Tidak menyimpan PII (input yang dikirim sudah melalui allowlist).';
COMMENT ON COLUMN ai_analyses.provider   IS 'gemini = panggilan live; cache = seed/ai-cache; aturan = fallback kata kunci.';
COMMENT ON COLUMN ai_analyses.input_hash IS 'sha256 dari input ternormalisasi; kunci file seed/ai-cache.';
COMMENT ON COLUMN ai_analyses.human_override IS 'Field yang dikoreksi manusia, mis. {"urgency":"tinggi"}.';
CREATE INDEX idx_ai_report  ON ai_analyses(report_id, purpose);
CREATE INDEX idx_ai_purpose ON ai_analyses(purpose, created_at);

CREATE TABLE chat_sessions (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode       VARCHAR(10) NOT NULL CHECK (mode IN ('lapor')),
  report_id  BIGINT REFERENCES reports(id),
  last_draft JSONB,
  status     VARCHAR(12) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','dikonfirmasi','ditinggalkan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE chat_sessions IS 'Hanya mode lapor. Chatbot FAQ stateless (POST /chat/faq) dan tidak disimpan.';

CREATE TABLE chat_messages (
  id         BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender     VARCHAR(10) NOT NULL CHECK (sender IN ('user','ai','system')),
  content    TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Lokasi publik dibulatkan ±110 m; tanpa foto, nama, dan deskripsi.
CREATE VIEW reports_public AS
SELECT r.id,
       r.category,
       r.status,
       r.urgency,
       r.kecamatan,
       r.kelurahan,
       r.created_at,
       r.is_synthetic,
       round(r.latitude::numeric, 3)  AS lat_approx,
       round(r.longitude::numeric, 3) AS lng_approx
FROM reports r
WHERE r.status <> 'ditolak';
