-- =====================================================================
-- 006_push.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.1
-- Isi     : push_tokens, notifications.pushed_at / push_status
-- Log Perubahan:
--   * Baru (keputusan tim 22 Okt): notifikasi push lewat Expo Push Service
--     dengan cadangan notifikasi in-app (polling) saat offline.
-- =====================================================================

CREATE TABLE push_tokens (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         VARCHAR(255) NOT NULL UNIQUE,
  platform      VARCHAR(10) NOT NULL CHECK (platform IN ('android','ios')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN push_tokens.token     IS 'ExponentPushToken[…] dari expo-notifications getExpoPushTokenAsync.';
COMMENT ON COLUMN push_tokens.is_active IS 'false bila Expo membalas DeviceNotRegistered atau pengguna keluar.';
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE is_active;

ALTER TABLE notifications
  ADD COLUMN push_status VARCHAR(15) NOT NULL DEFAULT 'tidak_dikirim'
    CHECK (push_status IN ('tidak_dikirim','terkirim','gagal')),
  ADD COLUMN pushed_at TIMESTAMPTZ;
COMMENT ON COLUMN notifications.push_status IS 'tidak_dikirim = tanpa token / offline (tetap tampil in-app); terkirim/gagal = hasil Expo Push.';
