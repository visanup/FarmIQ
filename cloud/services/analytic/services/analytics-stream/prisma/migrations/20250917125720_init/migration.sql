/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,farm_id,house_id,sensor_id,metric,window_s,bucket_start]` on the table `analytics_agg` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "analytics"."idx_agg_lookup";

-- AlterTable
ALTER TABLE "analytics"."analytics_agg" ADD COLUMN     "farm_id" TEXT,
ADD COLUMN     "house_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "analytics_agg_conflict_idx" ON "analytics"."analytics_agg"("tenant_id", "farm_id", "house_id", "sensor_id", "metric", "window_s", "bucket_start");
