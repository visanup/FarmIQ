/*
  Warnings:

  - The primary key for the `analytics_agg` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `factory_id` on the `analytics_agg` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `analytics_agg` table. All the data in the column will be lost.
  - You are about to drop the column `factory_id` on the `analytics_alerts` table. All the data in the column will be lost.
  - The primary key for the `analytics_anomaly` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `factory_id` on the `analytics_anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `analytics_anomaly` table. All the data in the column will be lost.
  - The primary key for the `analytics_kpi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `factory_id` on the `analytics_kpi` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `analytics_kpi` table. All the data in the column will be lost.
  - The primary key for the `analytics_spec_limits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `factory_id` on the `analytics_spec_limits` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `analytics_spec_limits` table. All the data in the column will be lost.
  - Made the column `farm_id` on table `analytics_agg` required. This step will fail if there are existing NULL values in that column.
  - Made the column `house_id` on table `analytics_agg` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `farm_id` to the `analytics_alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `analytics_anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `house_id` to the `analytics_anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `analytics_kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `house_id` to the `analytics_kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `analytics_spec_limits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `house_id` to the `analytics_spec_limits` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "analytics"."idx_analytics_alerts_tenant_factory_device";

-- DropIndex
DROP INDEX "analytics"."idx_anomaly_lookup";

-- DropIndex
DROP INDEX "analytics"."idx_kpi_lookup";

-- DropIndex
DROP INDEX "analytics"."idx_spec_lookup";

-- AlterTable
ALTER TABLE "analytics"."analytics_agg" DROP CONSTRAINT "analytics_agg_pk",
DROP COLUMN "factory_id",
DROP COLUMN "machine_id",
ALTER COLUMN "farm_id" SET NOT NULL,
ALTER COLUMN "house_id" SET NOT NULL,
ADD CONSTRAINT "analytics_agg_pk" PRIMARY KEY ("tenant_id", "farm_id", "house_id", "metric", "window_s", "bucket_start");

-- AlterTable
ALTER TABLE "analytics"."analytics_alerts" DROP COLUMN "factory_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "analytics"."analytics_anomaly" DROP CONSTRAINT "analytics_anomaly_pk",
DROP COLUMN "factory_id",
DROP COLUMN "machine_id",
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "house_id" TEXT NOT NULL,
ADD CONSTRAINT "analytics_anomaly_pk" PRIMARY KEY ("tenant_id", "farm_id", "house_id", "metric", "time", "rule_code");

-- AlterTable
ALTER TABLE "analytics"."analytics_kpi" DROP CONSTRAINT "analytics_kpi_pk",
DROP COLUMN "factory_id",
DROP COLUMN "machine_id",
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "house_id" TEXT NOT NULL,
ADD CONSTRAINT "analytics_kpi_pk" PRIMARY KEY ("tenant_id", "farm_id", "house_id", "metric", "period", "period_start");

-- AlterTable
ALTER TABLE "analytics"."analytics_spec_limits" DROP CONSTRAINT "analytics_spec_limits_pk",
DROP COLUMN "factory_id",
DROP COLUMN "machine_id",
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "house_id" TEXT NOT NULL,
ADD CONSTRAINT "analytics_spec_limits_pk" PRIMARY KEY ("tenant_id", "farm_id", "house_id", "metric", "period");

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_tenant_farm_device" ON "analytics"."analytics_alerts"("tenant_id", "farm_id", "device_id");

-- CreateIndex
CREATE INDEX "idx_anomaly_lookup" ON "analytics"."analytics_anomaly"("tenant_id", "farm_id", "house_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_kpi_lookup" ON "analytics"."analytics_kpi"("tenant_id", "farm_id", "house_id", "metric", "period", "period_start" DESC);

-- CreateIndex
CREATE INDEX "idx_spec_lookup" ON "analytics"."analytics_spec_limits"("tenant_id", "farm_id", "house_id", "metric");
