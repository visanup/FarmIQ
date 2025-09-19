-- CreateEnum
CREATE TYPE "alert_status" AS ENUM ('open', 'ack', 'closed');

-- CreateEnum
CREATE TYPE "quality_enum" AS ENUM ('raw', 'clean', 'anomaly', 'dlq', 'invalid', 'calibrating', 'stale');

-- CreateEnum
CREATE TYPE "run_status_enum" AS ENUM ('planned', 'running', 'completed', 'aborted');

-- CreateEnum
CREATE TYPE "weigh_status_enum" AS ENUM ('open', 'finalized', 'discarded');

-- DropEnum
DROP TYPE "kpi_period";

-- CreateTable
CREATE TABLE "alerts" (
    "alert_id" BIGSERIAL NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT,
    "run_id" BIGINT,
    "station_id" TEXT,
    "metric" TEXT,
    "severity" INTEGER,
    "title" TEXT,
    "message" TEXT,
    "context" JSONB,
    "status" "alert_status" NOT NULL DEFAULT 'open',

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "device_health" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "online" BOOLEAN,
    "source" TEXT,
    "rssi" INTEGER,
    "uptime_s" BIGINT,
    "meta" JSONB,

    CONSTRAINT "device_health_pkey" PRIMARY KEY ("time","tenant_id","device_id")
);

-- CreateTable
CREATE TABLE "device_readings" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensor_id" TEXT,
    "sensor_id_norm" TEXT NOT NULL DEFAULT COALESCE(sensor_id, '-'::text),
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "quality" "quality_enum" NOT NULL DEFAULT 'clean',
    "payload" JSONB,

    CONSTRAINT "device_readings_pkey" PRIMARY KEY ("time","tenant_id","device_id","metric","sensor_id_norm")
);

-- CreateTable
CREATE TABLE "houses" (
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "name" TEXT,
    "meta" JSONB,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("tenant_id","house_id")
);

-- CreateTable
CREATE TABLE "lab_readings" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "quality" "quality_enum" NOT NULL DEFAULT 'clean',
    "payload" JSONB,

    CONSTRAINT "lab_readings_pkey" PRIMARY KEY ("time","tenant_id","station_id","sensor_id","metric")
);

-- CreateTable
CREATE TABLE "lab_stations" (
    "tenant_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "name" TEXT,
    "house_id" TEXT,
    "spec" JSONB,

    CONSTRAINT "lab_stations_pkey" PRIMARY KEY ("tenant_id","station_id")
);

-- CreateTable
CREATE TABLE "media_objects" (
    "media_id" BIGSERIAL NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "sha256" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "meta" JSONB,

    CONSTRAINT "media_objects_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "metrics_dim" (
    "metric" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "thresholds" JSONB,
    "meta" JSONB,

    CONSTRAINT "metrics_dim_pkey" PRIMARY KEY ("metric")
);

-- CreateTable
CREATE TABLE "reading_media_map" (
    "map_id" BIGSERIAL NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT,
    "run_id" BIGINT,
    "station_id" TEXT,
    "sensor_id" TEXT,
    "metric" TEXT NOT NULL,
    "media_id" BIGINT NOT NULL,

    CONSTRAINT "reading_media_map_pkey" PRIMARY KEY ("map_id")
);

-- CreateTable
CREATE TABLE "robot_expected" (
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT NOT NULL,
    "sweep_every_min" INTEGER NOT NULL DEFAULT 180,
    "sample_during_sweep_sec" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "robot_expected_pkey" PRIMARY KEY ("tenant_id","robot_id")
);

-- CreateTable
CREATE TABLE "robot_pose" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT NOT NULL,
    "run_id" BIGINT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "speed_mps" DOUBLE PRECISION,
    "battery_v" DOUBLE PRECISION,
    "meta" JSONB,

    CONSTRAINT "robot_pose_pkey" PRIMARY KEY ("time","robot_id","run_id")
);

-- CreateTable
CREATE TABLE "robots" (
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT NOT NULL,
    "house_id" TEXT,
    "name" TEXT,
    "spec" JSONB,

    CONSTRAINT "robots_pkey" PRIMARY KEY ("tenant_id","robot_id")
);

-- CreateTable
CREATE TABLE "sensor_modules" (
    "tenant_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "robot_id" TEXT,
    "station_id" TEXT,
    "kind" TEXT NOT NULL,
    "calib" JSONB,
    "meta" JSONB,

    CONSTRAINT "sensor_modules_pkey" PRIMARY KEY ("tenant_id","sensor_id")
);

-- CreateTable
CREATE TABLE "sweep_readings" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT NOT NULL,
    "run_id" BIGINT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "zone_id" TEXT,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "value" DOUBLE PRECISION NOT NULL,
    "quality" "quality_enum" NOT NULL DEFAULT 'clean',
    "payload" JSONB,

    CONSTRAINT "sweep_readings_pkey" PRIMARY KEY ("time","robot_id","run_id","sensor_id","metric")
);

-- CreateTable
CREATE TABLE "sweep_runs" (
    "run_id" BIGSERIAL NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "robot_id" TEXT NOT NULL,
    "house_id" TEXT,
    "status" "run_status_enum" NOT NULL DEFAULT 'planned',
    "cadence_sec" INTEGER NOT NULL DEFAULT 60,
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "plan" JSONB,
    "summary" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sweep_runs_pkey" PRIMARY KEY ("run_id")
);

-- CreateTable
CREATE TABLE "sweep_waypoints" (
    "run_id" BIGINT NOT NULL,
    "seq" INTEGER NOT NULL,
    "planned_ts" TIMESTAMPTZ(6),
    "actual_ts" TIMESTAMPTZ(6),
    "tenant_id" TEXT,
    "house_id" TEXT,
    "zone_id" TEXT,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "sweep_waypoints_pkey" PRIMARY KEY ("run_id","seq")
);

-- CreateTable
CREATE TABLE "weigh_events" (
    "session_id" BIGINT NOT NULL,
    "seq" INTEGER NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL,
    "kind" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION,
    "media_id" BIGINT,
    "stable" BOOLEAN,
    "meta" JSONB,

    CONSTRAINT "weigh_events_pkey" PRIMARY KEY ("session_id","time","seq")
);

-- CreateTable
CREATE TABLE "weigh_sessions" (
    "session_id" BIGSERIAL NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "station_id" TEXT,
    "robot_id" TEXT,
    "run_id" BIGINT,
    "scale_sensor_id" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "trigger_source" TEXT,
    "status" "weigh_status_enum" NOT NULL DEFAULT 'open',
    "ground_truth_kg" DOUBLE PRECISION,
    "primary_media_id" BIGINT,
    "meta" JSONB,

    CONSTRAINT "weigh_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "zones" (
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "row_idx" INTEGER,
    "col_idx" INTEGER,
    "meta" JSONB,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("tenant_id","house_id","zone_id")
);

-- CreateIndex
CREATE INDEX "idx_alerts_tenant_time" ON "alerts"("tenant_id", "time" DESC);

-- CreateIndex
CREATE INDEX "device_health_time_idx" ON "device_health"("time" DESC);

-- CreateIndex
CREATE INDEX "device_readings_time_idx" ON "device_readings"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_devread_latest" ON "device_readings"("tenant_id", "device_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_lab_latest" ON "lab_readings"("tenant_id", "station_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "lab_readings_time_idx" ON "lab_readings"("time" DESC);

-- CreateIndex
CREATE INDEX "robot_pose_run_id_time_idx" ON "robot_pose"("run_id", "time" DESC);

-- CreateIndex
CREATE INDEX "robot_pose_time_idx" ON "robot_pose"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_readings_latest" ON "sweep_readings"("tenant_id", "robot_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_swr_run_metric_time" ON "sweep_readings"("run_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_swr_run_zone_metric" ON "sweep_readings"("run_id", "zone_id", "metric");

-- CreateIndex
CREATE INDEX "idx_swr_zone_time" ON "sweep_readings"("zone_id", "time" DESC);

-- CreateIndex
CREATE INDEX "sweep_readings_run_id_time_idx" ON "sweep_readings"("run_id", "time" DESC);

-- CreateIndex
CREATE INDEX "sweep_readings_time_idx" ON "sweep_readings"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_runs_tenant_robot_status_started" ON "sweep_runs"("tenant_id", "robot_id", "status", "started_at" DESC);

-- CreateIndex
CREATE INDEX "idx_runs_tenant_robot_time" ON "sweep_runs"("tenant_id", "robot_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "idx_weigh_events_session_kind_time" ON "weigh_events"("session_id", "kind", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_weigh_events_session_time" ON "weigh_events"("session_id", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_weigh_events_time" ON "weigh_events"("time", "kind");

-- CreateIndex
CREATE INDEX "weigh_events_time_idx" ON "weigh_events"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_weigh_sessions_tenant_time" ON "weigh_sessions"("tenant_id", "started_at" DESC);

-- AddForeignKey
ALTER TABLE "lab_readings" ADD CONSTRAINT "lab_readings_tenant_id_station_id_fkey" FOREIGN KEY ("tenant_id", "station_id") REFERENCES "lab_stations"("tenant_id", "station_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_stations" ADD CONSTRAINT "lab_stations_tenant_id_house_id_fkey" FOREIGN KEY ("tenant_id", "house_id") REFERENCES "houses"("tenant_id", "house_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reading_media_map" ADD CONSTRAINT "reading_media_map_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_objects"("media_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "robot_expected" ADD CONSTRAINT "robot_expected_tenant_id_robot_id_fkey" FOREIGN KEY ("tenant_id", "robot_id") REFERENCES "robots"("tenant_id", "robot_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "robot_pose" ADD CONSTRAINT "robot_pose_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "sweep_runs"("run_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "robots" ADD CONSTRAINT "robots_tenant_id_house_id_fkey" FOREIGN KEY ("tenant_id", "house_id") REFERENCES "houses"("tenant_id", "house_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensor_modules" ADD CONSTRAINT "sensor_modules_tenant_id_robot_id_fkey" FOREIGN KEY ("tenant_id", "robot_id") REFERENCES "robots"("tenant_id", "robot_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensor_modules" ADD CONSTRAINT "sensor_modules_tenant_id_station_id_fkey" FOREIGN KEY ("tenant_id", "station_id") REFERENCES "lab_stations"("tenant_id", "station_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sweep_readings" ADD CONSTRAINT "sweep_readings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "sweep_runs"("run_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sweep_runs" ADD CONSTRAINT "sweep_runs_tenant_id_house_id_fkey" FOREIGN KEY ("tenant_id", "house_id") REFERENCES "houses"("tenant_id", "house_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sweep_runs" ADD CONSTRAINT "sweep_runs_tenant_id_robot_id_fkey" FOREIGN KEY ("tenant_id", "robot_id") REFERENCES "robots"("tenant_id", "robot_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sweep_waypoints" ADD CONSTRAINT "sweep_waypoints_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "sweep_runs"("run_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sweep_waypoints" ADD CONSTRAINT "sweep_waypoints_tenant_id_house_id_zone_id_fkey" FOREIGN KEY ("tenant_id", "house_id", "zone_id") REFERENCES "zones"("tenant_id", "house_id", "zone_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_events" ADD CONSTRAINT "weigh_events_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_objects"("media_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_events" ADD CONSTRAINT "weigh_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "weigh_sessions"("session_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_sessions" ADD CONSTRAINT "fk_weigh_sessions_robot" FOREIGN KEY ("tenant_id", "robot_id") REFERENCES "robots"("tenant_id", "robot_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_sessions" ADD CONSTRAINT "fk_weigh_sessions_run" FOREIGN KEY ("run_id") REFERENCES "sweep_runs"("run_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_sessions" ADD CONSTRAINT "fk_weigh_sessions_scale_sensor" FOREIGN KEY ("tenant_id", "scale_sensor_id") REFERENCES "sensor_modules"("tenant_id", "sensor_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_sessions" ADD CONSTRAINT "fk_weigh_sessions_station" FOREIGN KEY ("tenant_id", "station_id") REFERENCES "lab_stations"("tenant_id", "station_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weigh_sessions" ADD CONSTRAINT "weigh_sessions_primary_media_id_fkey" FOREIGN KEY ("primary_media_id") REFERENCES "media_objects"("media_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_tenant_id_house_id_fkey" FOREIGN KEY ("tenant_id", "house_id") REFERENCES "houses"("tenant_id", "house_id") ON DELETE CASCADE ON UPDATE NO ACTION;
