-- =====================================================================
-- 003_actions.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.0
-- Isi     : matches, agency_referrals, actions, tasks, task_assignments,
--           evidences
-- Log Perubahan:
--   * agency_referrals.status (draf/terkirim/ditindaklanjuti) & origin
--     (instansi/campuran) digabung dari SDD v1 §7 (jalur campuran D1).
--   * actions.coordinator_id harus koordinator komunitas aksi (dicek di
--     actionStatus.service; FK saja tidak cukup).
--   * evidences: satu bukti milik tepat satu aksi ATAU satu rujukan;
--     verified_by <> uploaded_by ditegakkan di DB.
--   * Satu aksi aktif per laporan (unique index parsial).
-- =====================================================================

CREATE TABLE matches (
  id             BIGSERIAL PRIMARY KEY,
  report_id      BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  community_id   BIGINT NOT NULL REFERENCES communities(id),
  score          NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  score_detail   JSONB NOT NULL,
  rank           SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 10),
  status         VARCHAR(10) NOT NULL DEFAULT 'diusulkan'
                 CHECK (status IN ('diusulkan','diterima','ditolak','kedaluwarsa')),
  decline_reason VARCHAR(200),
  decided_by     BIGINT REFERENCES users(id),
  decided_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, community_id)
);
COMMENT ON COLUMN matches.score_detail IS '{"K":1,"A":1,"W":1,"J":0.92,"T":0.75,"weights":{...},"distanceKm":0.8,"reasons":[...]}';
COMMENT ON COLUMN matches.status       IS 'kedaluwarsa = match lain untuk laporan yang sama sudah diterima.';
CREATE INDEX idx_matches_report    ON matches(report_id, rank);
CREATE INDEX idx_matches_community ON matches(community_id, status);

CREATE TABLE agency_referrals (
  id              BIGSERIAL PRIMARY KEY,
  report_id       BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  agency_id       BIGINT REFERENCES agencies(id),
  origin          VARCHAR(10) NOT NULL CHECK (origin IN ('instansi','campuran')),
  status          VARCHAR(20) NOT NULL DEFAULT 'draf'
                  CHECK (status IN ('draf','terkirim','ditindaklanjuti')),
  draft_text      TEXT NOT NULL,
  ai_analysis_id  BIGINT REFERENCES ai_analyses(id),
  sent_by         BIGINT REFERENCES users(id),
  sent_at         TIMESTAMPTZ,
  external_ticket VARCHAR(100),
  followup_note   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id)
);
COMMENT ON TABLE  agency_referrals IS 'Draf siap kirim ke kanal resmi. Pengiriman dilakukan manusia di luar aplikasi; TIDAK ada integrasi API.';
COMMENT ON COLUMN agency_referrals.origin IS 'instansi = laporan diteruskan; campuran = dibuat bersamaan dengan jalur komunitas (status laporan ikut komunitas).';
COMMENT ON COLUMN agency_referrals.external_ticket IS 'Nomor tiket dari kanal resmi, dicatat manual bila ada.';

CREATE TABLE actions (
  id                BIGSERIAL PRIMARY KEY,
  report_id         BIGINT NOT NULL REFERENCES reports(id),
  community_id      BIGINT NOT NULL REFERENCES communities(id),
  match_id          BIGINT REFERENCES matches(id),
  coordinator_id    BIGINT NOT NULL REFERENCES users(id),
  title             VARCHAR(200) NOT NULL,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  meet_lat          DOUBLE PRECISION NOT NULL,
  meet_lng          DOUBLE PRECISION NOT NULL,
  meet_label        VARCHAR(150),
  dropoff_lat       DOUBLE PRECISION,
  dropoff_lng       DOUBLE PRECISION,
  dropoff_label     VARCHAR(150),
  volunteers_needed SMALLINT NOT NULL CHECK (volunteers_needed BETWEEN 1 AND 100),
  tools             TEXT[] NOT NULL DEFAULT '{}',
  safety_notes      TEXT[] NOT NULL CHECK (cardinality(safety_notes) >= 1),
  status            VARCHAR(25) NOT NULL DEFAULT 'direncanakan'
                    CHECK (status IN ('direncanakan','berjalan','menunggu_verifikasi',
                                      'terverifikasi','dibatalkan')),
  cancel_reason     VARCHAR(200),
  ai_plan_id        BIGINT REFERENCES ai_analyses(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at        TIMESTAMPTZ,
  submitted_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  CHECK ((dropoff_lat IS NULL) = (dropoff_lng IS NULL)),
  CHECK (status <> 'dibatalkan' OR cancel_reason IS NOT NULL)
);
COMMENT ON COLUMN actions.dropoff_lat IS 'Titik buang/serah, mis. TPS. Opsional.';
COMMENT ON COLUMN actions.ai_plan_id  IS 'Draf rencana AI-3 yang menjadi dasar; versi akhir = isi kolom aksi & tasks.';
CREATE UNIQUE INDEX uq_actions_active_per_report ON actions(report_id)
  WHERE status <> 'dibatalkan';
CREATE INDEX idx_actions_community ON actions(community_id, status);

CREATE TABLE tasks (
  id         BIGSERIAL PRIMARY KEY,
  action_id  BIGINT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  skill      VARCHAR(30),
  quota      SMALLINT NOT NULL DEFAULT 1 CHECK (quota BETWEEN 1 AND 50),
  needs_route BOOLEAN NOT NULL DEFAULT false,
  status     VARCHAR(10) NOT NULL DEFAULT 'terbuka'
             CHECK (status IN ('terbuka','diambil','selesai')),
  sort_order SMALLINT NOT NULL DEFAULT 0
);
COMMENT ON COLUMN tasks.status      IS 'terbuka = kuota belum penuh; diambil = penugasan = quota; selesai = ditandai selesai.';
COMMENT ON COLUMN tasks.needs_route IS 'true untuk tugas angkut: rute meet -> lokasi -> dropoff ditampilkan.';
CREATE INDEX idx_tasks_action ON tasks(action_id);

CREATE TABLE task_assignments (
  task_id       BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  assigned_by   BIGINT REFERENCES users(id),
  checked_in_at TIMESTAMPTZ,
  hours         NUMERIC(4,1) CHECK (hours BETWEEN 0 AND 24),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);
COMMENT ON COLUMN task_assignments.assigned_by IS 'NULL = relawan mengambil sendiri; terisi = ditugaskan koordinator.';
CREATE INDEX idx_assign_user ON task_assignments(user_id);

CREATE TABLE evidences (
  id            BIGSERIAL PRIMARY KEY,
  action_id     BIGINT REFERENCES actions(id) ON DELETE CASCADE,
  referral_id   BIGINT REFERENCES agency_referrals(id) ON DELETE CASCADE,
  kind          VARCHAR(6) NOT NULL CHECK (kind IN ('before','after')),
  file_path     TEXT NOT NULL,
  note          VARCHAR(500),
  volume_kg_est NUMERIC(7,1) CHECK (volume_kg_est >= 0),
  uploaded_by   BIGINT NOT NULL REFERENCES users(id),
  verified_by   BIGINT REFERENCES users(id),
  verified_at   TIMESTAMPTZ,
  verify_status VARCHAR(10) NOT NULL DEFAULT 'menunggu'
                CHECK (verify_status IN ('menunggu','sah','ditolak')),
  verify_reason VARCHAR(300),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (verified_by IS NULL OR verified_by <> uploaded_by),
  CHECK ((action_id IS NULL) <> (referral_id IS NULL)),
  CHECK (verify_status <> 'ditolak' OR verify_reason IS NOT NULL)
);
COMMENT ON COLUMN evidences.volume_kg_est IS 'Perkiraan koordinator, bukan hasil timbang. Ditampilkan berlabel "perkiraan".';
CREATE INDEX idx_evidences_action   ON evidences(action_id);
CREATE INDEX idx_evidences_referral ON evidences(referral_id);
CREATE INDEX idx_evidences_pending  ON evidences(verify_status) WHERE verify_status = 'menunggu';
