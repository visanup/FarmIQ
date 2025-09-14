/*
  Warnings:

  - The primary key for the `lab_readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sweep_readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `sensor_readings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "sensors"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "sensors"."StreamType" AS ENUM ('SENSOR', 'LAB', 'SWEEP', 'HEALTH');

-- CreateEnum
CREATE TYPE "sensors"."ConfigType" AS ENUM ('SENSOR_CONFIG', 'STREAM_CONFIG', 'ALERT_CONFIG', 'DEVICE_CONFIG');

-- CreateEnum
CREATE TYPE "sensors"."DataQualityStatus" AS ENUM ('PASS', 'FAIL', 'WARNING', 'SKIPPED');

-- AlterTable
ALTER TABLE "sensors"."lab_readings" DROP CONSTRAINT "lab_readings_pkey",
ALTER COLUMN "id" DROP NOT NULL,
ADD CONSTRAINT "lab_readings_pkey" PRIMARY KEY ("sampleId");

-- AlterTable
ALTER TABLE "sensors"."sweep_readings" DROP CONSTRAINT "sweep_readings_pkey",
ALTER COLUMN "id" DROP NOT NULL,
ADD CONSTRAINT "sweep_readings_pkey" PRIMARY KEY ("sweepId");

-- DropTable
DROP TABLE "sensors"."sensor_readings";

-- CreateTable
CREATE TABLE "sensors"."device_readings" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "sensor_id" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "quality" TEXT NOT NULL DEFAULT 'clean',
    "payload" JSONB,

    CONSTRAINT "device_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."stream_states" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "streamType" "sensors"."StreamType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastProcessedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."device_configurations" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "configType" "sensors"."ConfigType" NOT NULL,
    "configData" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."sensor_alerts" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "farmId" TEXT,
    "houseId" TEXT,
    "alertType" TEXT NOT NULL,
    "severity" "sensors"."AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "value" DECIMAL(10,4),
    "threshold" DECIMAL(10,4),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."data_quality_checks" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "value" DECIMAL(10,4),
    "expectedMin" DECIMAL(10,4),
    "expectedMax" DECIMAL(10,4),
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."_DeviceReadingToSensorAlert" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "sensors"."_DataQualityCheckToDeviceReading" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "sensors"."_DataQualityCheckToLabReading" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "sensors"."_DataQualityCheckToSweepReading" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "device_readings_device_id_time_idx" ON "sensors"."device_readings"("device_id", "time");

-- CreateIndex
CREATE INDEX "device_readings_metric_time_idx" ON "sensors"."device_readings"("metric", "time");

-- CreateIndex
CREATE INDEX "device_readings_tenant_id_time_idx" ON "sensors"."device_readings"("tenant_id", "time");

-- CreateIndex
CREATE INDEX "device_readings_time_idx" ON "sensors"."device_readings"("time");

-- CreateIndex
CREATE UNIQUE INDEX "device_readings_time_device_id_metric_key" ON "sensors"."device_readings"("time", "device_id", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "stream_states_deviceId_key" ON "sensors"."stream_states"("deviceId");

-- CreateIndex
CREATE INDEX "stream_states_deviceId_streamType_idx" ON "sensors"."stream_states"("deviceId", "streamType");

-- CreateIndex
CREATE INDEX "stream_states_isActive_idx" ON "sensors"."stream_states"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "device_configurations_deviceId_key" ON "sensors"."device_configurations"("deviceId");

-- CreateIndex
CREATE INDEX "device_configurations_deviceId_configType_idx" ON "sensors"."device_configurations"("deviceId", "configType");

-- CreateIndex
CREATE INDEX "device_configurations_isActive_idx" ON "sensors"."device_configurations"("isActive");

-- CreateIndex
CREATE INDEX "sensor_alerts_deviceId_createdAt_idx" ON "sensors"."sensor_alerts"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "sensor_alerts_alertType_severity_idx" ON "sensors"."sensor_alerts"("alertType", "severity");

-- CreateIndex
CREATE INDEX "sensor_alerts_isResolved_idx" ON "sensors"."sensor_alerts"("isResolved");

-- CreateIndex
CREATE INDEX "sensor_alerts_farmId_createdAt_idx" ON "sensors"."sensor_alerts"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "sensor_alerts_houseId_createdAt_idx" ON "sensors"."sensor_alerts"("houseId", "createdAt");

-- CreateIndex
CREATE INDEX "data_quality_checks_deviceId_timestamp_idx" ON "sensors"."data_quality_checks"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "data_quality_checks_checkType_status_idx" ON "sensors"."data_quality_checks"("checkType", "status");

-- CreateIndex
CREATE INDEX "data_quality_checks_timestamp_idx" ON "sensors"."data_quality_checks"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceReadingToSensorAlert_AB_unique" ON "sensors"."_DeviceReadingToSensorAlert"("A", "B");

-- CreateIndex
CREATE INDEX "_DeviceReadingToSensorAlert_B_index" ON "sensors"."_DeviceReadingToSensorAlert"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DataQualityCheckToDeviceReading_AB_unique" ON "sensors"."_DataQualityCheckToDeviceReading"("A", "B");

-- CreateIndex
CREATE INDEX "_DataQualityCheckToDeviceReading_B_index" ON "sensors"."_DataQualityCheckToDeviceReading"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DataQualityCheckToLabReading_AB_unique" ON "sensors"."_DataQualityCheckToLabReading"("A", "B");

-- CreateIndex
CREATE INDEX "_DataQualityCheckToLabReading_B_index" ON "sensors"."_DataQualityCheckToLabReading"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DataQualityCheckToSweepReading_AB_unique" ON "sensors"."_DataQualityCheckToSweepReading"("A", "B");

-- CreateIndex
CREATE INDEX "_DataQualityCheckToSweepReading_B_index" ON "sensors"."_DataQualityCheckToSweepReading"("B");

-- CreateIndex
CREATE INDEX "device_health_deviceId_idx" ON "sensors"."device_health"("deviceId");

-- CreateIndex
CREATE INDEX "device_health_status_idx" ON "sensors"."device_health"("status");

-- CreateIndex
CREATE INDEX "device_health_lastSeen_idx" ON "sensors"."device_health"("lastSeen");

-- CreateIndex
CREATE INDEX "lab_readings_timestamp_idx" ON "sensors"."lab_readings"("timestamp");

-- CreateIndex
CREATE INDEX "sweep_readings_timestamp_idx" ON "sensors"."sweep_readings"("timestamp");

-- AddForeignKey
ALTER TABLE "sensors"."_DeviceReadingToSensorAlert" ADD CONSTRAINT "_DeviceReadingToSensorAlert_A_fkey" FOREIGN KEY ("A") REFERENCES "sensors"."device_readings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DeviceReadingToSensorAlert" ADD CONSTRAINT "_DeviceReadingToSensorAlert_B_fkey" FOREIGN KEY ("B") REFERENCES "sensors"."sensor_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToDeviceReading" ADD CONSTRAINT "_DataQualityCheckToDeviceReading_A_fkey" FOREIGN KEY ("A") REFERENCES "sensors"."data_quality_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToDeviceReading" ADD CONSTRAINT "_DataQualityCheckToDeviceReading_B_fkey" FOREIGN KEY ("B") REFERENCES "sensors"."device_readings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToLabReading" ADD CONSTRAINT "_DataQualityCheckToLabReading_A_fkey" FOREIGN KEY ("A") REFERENCES "sensors"."data_quality_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToLabReading" ADD CONSTRAINT "_DataQualityCheckToLabReading_B_fkey" FOREIGN KEY ("B") REFERENCES "sensors"."lab_readings"("sampleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToSweepReading" ADD CONSTRAINT "_DataQualityCheckToSweepReading_A_fkey" FOREIGN KEY ("A") REFERENCES "sensors"."data_quality_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors"."_DataQualityCheckToSweepReading" ADD CONSTRAINT "_DataQualityCheckToSweepReading_B_fkey" FOREIGN KEY ("B") REFERENCES "sensors"."sweep_readings"("sweepId") ON DELETE CASCADE ON UPDATE CASCADE;
