-- =====================================================================
-- 005_audit.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.0
-- Isi     : audit_logs, notifications
-- Log Perubahan:
--   * audit_logs menggantikan tabel "activities" usulan awal.
--   * notifications digabung dari SDD v1 §7 + kolom title/body berbahasa
--     Indonesia agar frontend tidak menyusun teks sendiri.
-- =====================================================================

CREATE TABLE audit_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id),
  action     VARCHAR(50) NOT NULL,
  entity     VARCHAR(30) NOT NULL,
  entity_id  BIGINT,
  meta       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN audit_logs.action IS 'Format <entity>.<verb>, mis. report.verify, evidence.verify, obstacle.create, auth.login.';
COMMENT ON COLUMN audit_logs.meta   IS 'Tanpa PII: hanya id, status lama/baru, alasan berkode.';
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE TABLE notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL CHECK (type IN
             ('report_status','match_new','task_assigned','evidence_pending',
              'evidence_result','referral_update','obstacle_confirm')),
  title      VARCHAR(120) NOT NULL,
  body       VARCHAR(300),
  entity     VARCHAR(30) NOT NULL,
  entity_id  BIGINT NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_unread ON notifications(user_id, created_at) WHERE read_at IS NULL;
