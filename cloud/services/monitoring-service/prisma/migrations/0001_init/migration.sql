-- CreateTable
CREATE TABLE "alerts" (
    "tenant_id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "farm_id" TEXT,
    "house_id" TEXT,
    "device_id" TEXT,
    "batch_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("tenant_id","alert_id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "threshold" DECIMAL NOT NULL,
    "condition" TEXT NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("tenant_id","rule_id")
);

-- CreateTable
CREATE TABLE "device_health_log" (
    "tenant_id" TEXT NOT NULL,
    "id" BIGSERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "time" TIMESTAMPTZ NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_health_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_alerts_status" ON "alerts"("tenant_id", "status", "severity", "created_at");

-- CreateIndex
CREATE INDEX "ix_rules_metric" ON "alert_rules"("tenant_id", "metric_name");

-- CreateIndex
CREATE INDEX "ix_health_time" ON "device_health_log"("tenant_id", "device_id", "time");

