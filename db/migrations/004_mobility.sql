-- =====================================================================
-- 004_mobility.sql — SUSI Connect
-- Tanggal : 2026-10-22 · Versi skema : 2.0
-- Isi     : road_obstacles, obstacle_confirmations, route_cache
-- Log Perubahan:
--   * route_cache digabung dari SDD v1 §7.
--   * road_obstacles.source_role mencatat peran pembuat; hambatan dari
--     warga/relawan (S01) dibuat 'menunggu_konfirmasi'.
--   * Status 'kedaluwarsa' TIDAK disimpan: dihitung dari expires_at < now()
--     agar tidak perlu cron.
-- =====================================================================

CREATE TABLE road_obstacles (
  id           BIGSERIAL PRIMARY KEY,
  type         VARCHAR(20) NOT NULL CHECK (type IN
               ('perbaikan_jalan','demo','banjir','pohon_tumbang','kegiatan_warga','lainnya')),
  latitude     DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude    DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  radius_m     INT NOT NULL DEFAULT 50 CHECK (radius_m BETWEEN 10 AND 500),
  description  VARCHAR(300),
  created_by   BIGINT NOT NULL REFERENCES users(id),
  source_role  VARCHAR(20) NOT NULL CHECK (source_role IN
               ('koordinator','moderator','instansi','admin','warga')),
  status       VARCHAR(25) NOT NULL DEFAULT 'aktif'
               CHECK (status IN ('menunggu_konfirmasi','aktif','dicabut')),
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_by   BIGINT REFERENCES users(id),
  is_synthetic BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at),
  CHECK (expires_at <= created_at + INTERVAL '30 days')
);
COMMENT ON COLUMN road_obstacles.status     IS 'Kedaluwarsa = expires_at < now(), tidak disimpan sebagai status.';
COMMENT ON COLUMN road_obstacles.source_role IS 'Peran efektif pembuat. warga = berasal dari S01, butuh 2 konfirmasi.';
CREATE INDEX idx_obstacles_active ON road_obstacles(status, expires_at);
CREATE INDEX idx_obstacles_geo    ON road_obstacles(latitude, longitude);

CREATE TABLE obstacle_confirmations (
  obstacle_id BIGINT NOT NULL REFERENCES road_obstacles(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  still_there BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (obstacle_id, user_id)
);
COMMENT ON TABLE obstacle_confirmations IS 'S01: 2 konfirmasi still_there=true -> aktif; 2 still_there=false -> dicabut.';

CREATE TABLE route_cache (
  cache_key  CHAR(64) PRIMARY KEY,
  profile    VARCHAR(20) NOT NULL CHECK (profile IN ('foot-walking','cycling-regular','driving-car')),
  response   JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
COMMENT ON COLUMN route_cache.cache_key IS 'sha256(from 4 desimal | to 4 desimal | profile | id:expires_at hambatan terurut).';
CREATE INDEX idx_route_cache_exp ON route_cache(expires_at);
