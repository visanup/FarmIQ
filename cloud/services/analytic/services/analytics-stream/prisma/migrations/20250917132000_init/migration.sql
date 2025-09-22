/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,farm_id,house_id,flock_id,measurement_date]` on the table `health_metrics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "analytics"."health_metrics" ADD COLUMN     "co2_level" DOUBLE PRECISION,
ADD COLUMN     "nh3_level" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "health_metrics_conflict_idx" ON "analytics"."health_metrics"("tenant_id", "farm_id", "house_id", "flock_id", "measurement_date");
