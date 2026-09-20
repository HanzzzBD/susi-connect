-- schema.sql
-- Direkonstruksi dari ER diagram (DBeaver) + src/services/api.ts (frontend)
-- Beberapa tipe kolom adalah ASUMSI WAJAR (mis. length varchar, default value)
-- karena ER diagram tidak menunjukkan tipe data persis. Sesuaikan bila kamu
-- ingat detail aslinya.

CREATE TABLE IF NOT EXISTS stations (
  id              VARCHAR(50) PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  coordinates     POINT NOT NULL,              -- disimpan sebagai (lng, lat), lihat parseCoordinates() di api.ts
  route_or_line   VARCHAR(100) NOT NULL,        -- disebut "corridor" di frontend
  passenger_count INTEGER NOT NULL DEFAULT 0,
  density_level   VARCHAR(20) NOT NULL DEFAULT 'low',   -- contoh: low / medium / high
  density_score   NUMERIC(3,2) NOT NULL DEFAULT 0,      -- pg mengembalikan sbg string, di-parseFloat di frontend
  avg_dwell_time_sec   INTEGER NOT NULL DEFAULT 0,
  next_arrival_eta_sec INTEGER NOT NULL DEFAULT 0,       -- disebut "bus_arrival_eta_sec" di frontend
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  ai_anomaly_flag BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  transport_type  VARCHAR(50),
  station_code    VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS fleet_units (
  unit_id             VARCHAR(50) PRIMARY KEY,
  unit_name           VARCHAR(150) NOT NULL,
  transport_type      VARCHAR(50) NOT NULL,
  assigned_corridor   VARCHAR(100) NOT NULL,
  current_status      VARCHAR(20) NOT NULL DEFAULT 'active',
  current_speed_kmh   NUMERIC(5,2) NOT NULL DEFAULT 0,
  passenger_capacity  INTEGER NOT NULL DEFAULT 0,
  current_load        INTEGER NOT NULL DEFAULT 0,
  last_lat            DOUBLE PRECISION,
  last_lng            DOUBLE PRECISION,
  last_updated        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS station_flags (
  id              SERIAL PRIMARY KEY,
  station_id      VARCHAR(50) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  flag_type       VARCHAR(20) NOT NULL CHECK (flag_type IN ('problematic', 'optimal')),
  severity_level  VARCHAR(20),
  notes           TEXT,
  flagged_by      VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_flag     BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_station_flags_station_id ON station_flags(station_id);
CREATE INDEX IF NOT EXISTS idx_station_flags_active ON station_flags(active_flag);
CREATE INDEX IF NOT EXISTS idx_station_flags_type ON station_flags(flag_type);

CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,   -- asumsi: hash (bcrypt), bukan plaintext
  name        VARCHAR(150) NOT NULL,
  last_login  TIMESTAMPTZ
);
