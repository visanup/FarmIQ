-- AlterTable
ALTER TABLE "analytics"."health_metrics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "analytics"."production_metrics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
