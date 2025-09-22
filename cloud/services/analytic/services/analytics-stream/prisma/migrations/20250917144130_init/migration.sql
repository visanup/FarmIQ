/*
  Warnings:

  - The primary key for the `analytics_kpi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[tenant_id,farm_id,house_id,flock_id,period_start,period_end]` on the table `fcr_calculations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,farm_id,house_id,flock_id,period_start,period_end]` on the table `production_metrics` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sensor_id` on table `analytics_agg` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sensor_id` on table `analytics_kpi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "analytics"."analytics_agg" ALTER COLUMN "sensor_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "analytics"."analytics_kpi" DROP CONSTRAINT "analytics_kpi_pk",
ALTER COLUMN "sensor_id" SET NOT NULL,
ADD CONSTRAINT "analytics_kpi_pk" PRIMARY KEY ("tenant_id", "farm_id", "house_id", "sensor_id", "metric", "period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "fcr_calculations_conflict_idx" ON "analytics"."fcr_calculations"("tenant_id", "farm_id", "house_id", "flock_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "production_metrics_conflict_idx" ON "analytics"."production_metrics"("tenant_id", "farm_id", "house_id", "flock_id", "period_start", "period_end");
