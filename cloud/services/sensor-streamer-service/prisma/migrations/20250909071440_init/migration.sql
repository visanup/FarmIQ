-- CreateEnum
CREATE TYPE "sensors"."DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "sensors"."sensor_readings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "farmId" TEXT,
    "houseId" TEXT,
    "sensorType" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "location" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."device_health" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" "sensors"."DeviceStatus" NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "batteryLevel" INTEGER,
    "signalStrength" INTEGER,
    "temperature" DECIMAL(5,2),
    "errors" TEXT[],
    "warnings" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."lab_readings" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "farmId" TEXT,
    "testType" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "result" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."sweep_readings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "farmId" TEXT,
    "sweepId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sweep_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors"."data_ingestion_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_ingestion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sensor_readings_deviceId_timestamp_idx" ON "sensors"."sensor_readings"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "sensor_readings_sensorType_timestamp_idx" ON "sensors"."sensor_readings"("sensorType", "timestamp");

-- CreateIndex
CREATE INDEX "sensor_readings_farmId_timestamp_idx" ON "sensors"."sensor_readings"("farmId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "device_health_deviceId_key" ON "sensors"."device_health"("deviceId");

-- CreateIndex
CREATE INDEX "lab_readings_sampleId_timestamp_idx" ON "sensors"."lab_readings"("sampleId", "timestamp");

-- CreateIndex
CREATE INDEX "lab_readings_testType_timestamp_idx" ON "sensors"."lab_readings"("testType", "timestamp");

-- CreateIndex
CREATE INDEX "lab_readings_farmId_timestamp_idx" ON "sensors"."lab_readings"("farmId", "timestamp");

-- CreateIndex
CREATE INDEX "sweep_readings_deviceId_timestamp_idx" ON "sensors"."sweep_readings"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "sweep_readings_sweepId_timestamp_idx" ON "sensors"."sweep_readings"("sweepId", "timestamp");

-- CreateIndex
CREATE INDEX "sweep_readings_farmId_timestamp_idx" ON "sensors"."sweep_readings"("farmId", "timestamp");

-- CreateIndex
CREATE INDEX "data_ingestion_logs_source_timestamp_idx" ON "sensors"."data_ingestion_logs"("source", "timestamp");

-- CreateIndex
CREATE INDEX "data_ingestion_logs_dataType_timestamp_idx" ON "sensors"."data_ingestion_logs"("dataType", "timestamp");
