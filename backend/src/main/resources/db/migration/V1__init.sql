CREATE TABLE IF NOT EXISTS telemetry (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    seq BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device_ts ON telemetry (device_id, ts);
CREATE INDEX IF NOT EXISTS idx_telemetry_devtype_ts ON telemetry (device_id, type, ts);
CREATE UNIQUE INDEX IF NOT EXISTS uq_telemetry_device_seq ON telemetry (device_id, seq);
