-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "edge_orchestrator";

-- CreateTable
CREATE TABLE "edge_orchestrator"."dataset_exports" (
    "id" TEXT NOT NULL,
    "datasetS3" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "metaJson" JSONB,
    "tenantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dataset_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edge_orchestrator"."model_registry" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "config" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edge_orchestrator"."weight_mappings" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dataset_exports_tenantId_createdAt_idx" ON "edge_orchestrator"."dataset_exports"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "model_registry_modelId_key" ON "edge_orchestrator"."model_registry"("modelId");

-- CreateIndex
CREATE INDEX "model_registry_tenantId_status_idx" ON "edge_orchestrator"."model_registry"("tenantId", "status");

-- CreateIndex
CREATE INDEX "model_registry_modelId_idx" ON "edge_orchestrator"."model_registry"("modelId");

-- CreateIndex
CREATE INDEX "weight_mappings_mediaId_idx" ON "edge_orchestrator"."weight_mappings"("mediaId");

-- CreateIndex
CREATE INDEX "weight_mappings_tenantId_createdAt_idx" ON "edge_orchestrator"."weight_mappings"("tenantId", "createdAt");
