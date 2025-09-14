-- CreateEnum
CREATE TYPE "analytics"."PredictionType" AS ENUM ('FCR', 'WEIGHT', 'HEALTH', 'PRODUCTION', 'MORTALITY', 'FEED_INTAKE', 'WATER_INTAKE');

-- CreateEnum
CREATE TYPE "analytics"."ModelStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRAINING', 'ERROR', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "analytics"."JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "analytics"."JobType" AS ENUM ('FCR_CALCULATION', 'PREDICTION', 'ANOMALY_DETECTION', 'SIZE_DISTRIBUTION', 'HEALTH_ANALYSIS', 'PRODUCTION_ANALYSIS', 'ENVIRONMENTAL_ANALYSIS');

-- CreateEnum
CREATE TYPE "analytics"."ConfigType" AS ENUM ('FCR', 'PREDICTION', 'ALERT', 'KPI', 'THRESHOLD', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "analytics"."WeightClass" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');

-- CreateEnum
CREATE TYPE "analytics"."SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "analytics"."minute_features" (
    "bucket" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL DEFAULT '',
    "metric" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '{}',
    "tags_hash" TEXT NOT NULL,
    "value_count" BIGINT NOT NULL DEFAULT 0,
    "value_sum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "value_min" DOUBLE PRECISION NOT NULL,
    "value_max" DOUBLE PRECISION NOT NULL,
    "value_sumsq" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "minute_features_pk" PRIMARY KEY ("bucket","tenant_id","device_id","metric","sensor_id","tags_hash")
);

-- CreateTable
CREATE TABLE "analytics"."dim_device" (
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "farm_id" TEXT,
    "house_id" TEXT,
    "type" TEXT,
    "status" TEXT,
    "name" TEXT,
    "model" TEXT,
    "vendor" TEXT,
    "serial_no" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_device_pkey" PRIMARY KEY ("tenant_id","device_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_farm" (
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "region" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_farm_pkey" PRIMARY KEY ("tenant_id","farm_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_house" (
    "tenant_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT,
    "capacity" INTEGER,
    "type" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_house_pkey" PRIMARY KEY ("tenant_id","house_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_flock" (
    "tenant_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "farm_id" TEXT,
    "breed" TEXT,
    "sex" TEXT,
    "population" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_flock_pkey" PRIMARY KEY ("tenant_id","flock_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_customer" (
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_customer_pkey" PRIMARY KEY ("tenant_id","customer_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_animal_type" (
    "tenant_id" TEXT NOT NULL,
    "animal_type_id" TEXT NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "description" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_animal_type_pkey" PRIMARY KEY ("tenant_id","animal_type_id")
);

-- CreateTable
CREATE TABLE "analytics"."dim_breed" (
    "tenant_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "animal_type_id" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "description" TEXT,
    "characteristics" JSONB NOT NULL DEFAULT '{}',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dim_breed_pkey" PRIMARY KEY ("tenant_id","breed_id")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_agg" (
    "bucket_start" TIMESTAMPTZ(6) NOT NULL,
    "window_s" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "sensor_id" TEXT,
    "metric" TEXT NOT NULL,
    "count_n" BIGINT NOT NULL DEFAULT 0,
    "sum_val" DOUBLE PRECISION,
    "avg_val" DOUBLE PRECISION,
    "min_val" DOUBLE PRECISION,
    "max_val" DOUBLE PRECISION,
    "stddev_val" DOUBLE PRECISION,
    "p95_val" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_agg_pk" PRIMARY KEY ("tenant_id","factory_id","machine_id","metric","window_s","bucket_start")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_event" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "severity" SMALLINT,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pk" PRIMARY KEY ("tenant_id","domain","entity_type","entity_id","event_type","time")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_event_rollup" (
    "bucket_start" TIMESTAMPTZ(6) NOT NULL,
    "window_s" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "count_n" BIGINT NOT NULL DEFAULT 0,
    "sum_val" DOUBLE PRECISION,
    "avg_val" DOUBLE PRECISION,
    "min_val" DOUBLE PRECISION,
    "max_val" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_rollup_pk" PRIMARY KEY ("tenant_id","domain","entity_type","entity_id","event_type","window_s","bucket_start")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_kpi" (
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "sensor_id" TEXT,
    "metric" TEXT NOT NULL,
    "n" BIGINT NOT NULL DEFAULT 0,
    "mean_val" DOUBLE PRECISION,
    "stddev_val" DOUBLE PRECISION,
    "cp" DOUBLE PRECISION,
    "cpk" DOUBLE PRECISION,
    "pp" DOUBLE PRECISION,
    "ppk" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_kpi_pk" PRIMARY KEY ("tenant_id","factory_id","machine_id","metric","period","period_start")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_anomaly" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "sensor_id" TEXT,
    "metric" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "severity" SMALLINT NOT NULL DEFAULT 1,
    "value" DOUBLE PRECISION NOT NULL,
    "cl" DOUBLE PRECISION,
    "ucl" DOUBLE PRECISION,
    "lcl" DOUBLE PRECISION,
    "zscore" DOUBLE PRECISION,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_anomaly_pk" PRIMARY KEY ("tenant_id","factory_id","machine_id","metric","time","rule_code")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_alerts" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "is_resolved" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "tenant_id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "alert_time" TIMESTAMPTZ(6) NOT NULL,
    "severity" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "additional_info" JSONB,

    CONSTRAINT "analytics_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_spec_limits" (
    "tenant_id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "sensor_id" TEXT,
    "metric" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "cl" DOUBLE PRECISION,
    "ucl" DOUBLE PRECISION,
    "lcl" DOUBLE PRECISION,
    "method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_spec_limits_pk" PRIMARY KEY ("tenant_id","factory_id","machine_id","metric","period")
);

-- CreateTable
CREATE TABLE "analytics"."feature_publish_log" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bucket" TIMESTAMPTZ(6) NOT NULL,
    "device_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL DEFAULT '',
    "metric" TEXT NOT NULL,
    "tags_hash" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_publish_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."metric_catalog" (
    "metric" TEXT NOT NULL,
    "display_name" TEXT,
    "unit" TEXT,
    "rollup" TEXT NOT NULL DEFAULT 'avg',
    "decimals" INTEGER DEFAULT 2,
    "lower_bound" DOUBLE PRECISION,
    "upper_bound" DOUBLE PRECISION,
    "tags_schema" JSONB DEFAULT '{}',
    "description" TEXT,

    CONSTRAINT "metric_catalog_pkey" PRIMARY KEY ("metric")
);

-- CreateTable
CREATE TABLE "analytics"."minute_watermark" (
    "tenant_id" TEXT NOT NULL,
    "watermark" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "minute_watermark_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "analytics"."worker_checkpoints" (
    "group_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "partition_id" INTEGER NOT NULL,
    "last_offset" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_checkpoints_pk" PRIMARY KEY ("group_id","topic","partition_id")
);

-- CreateTable
CREATE TABLE "analytics"."fcr_calculations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "period_start" TIMESTAMPTZ(6) NOT NULL,
    "period_end" TIMESTAMPTZ(6) NOT NULL,
    "total_feed" DOUBLE PRECISION NOT NULL,
    "total_weight" DOUBLE PRECISION NOT NULL,
    "fcr_value" DOUBLE PRECISION NOT NULL,
    "population" INTEGER,
    "breed" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fcr_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."fcr_targets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT,
    "breed" TEXT,
    "target_fcr" DOUBLE PRECISION NOT NULL,
    "min_fcr" DOUBLE PRECISION,
    "max_fcr" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fcr_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."size_distributions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "measurement_date" TIMESTAMPTZ(6) NOT NULL,
    "weight_class" "analytics"."WeightClass" NOT NULL,
    "min_weight" DOUBLE PRECISION NOT NULL,
    "max_weight" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "size_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."prediction_models" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_type" "analytics"."PredictionType" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "analytics"."ModelStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."predictions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT,
    "flock_id" TEXT,
    "device_id" TEXT,
    "prediction_type" "analytics"."PredictionType" NOT NULL,
    "target_date" TIMESTAMPTZ(6) NOT NULL,
    "predicted_value" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "actual_value" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."health_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "measurement_date" TIMESTAMPTZ(6) NOT NULL,
    "mortality_rate" DOUBLE PRECISION NOT NULL,
    "morbidity_rate" DOUBLE PRECISION NOT NULL,
    "avg_weight" DOUBLE PRECISION,
    "feed_intake" DOUBLE PRECISION,
    "water_intake" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."production_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "period_start" TIMESTAMPTZ(6) NOT NULL,
    "period_end" TIMESTAMPTZ(6) NOT NULL,
    "total_production" DOUBLE PRECISION NOT NULL,
    "daily_production" DOUBLE PRECISION NOT NULL,
    "production_rate" DOUBLE PRECISION NOT NULL,
    "quality_score" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."environmental_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "measurement_date" TIMESTAMPTZ(6) NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "co2_level" DOUBLE PRECISION,
    "nh3_level" DOUBLE PRECISION,
    "light_level" DOUBLE PRECISION,
    "air_velocity" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environmental_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "config_type" "analytics"."ConfigType" NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics"."analytics_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "job_type" "analytics"."JobType" NOT NULL,
    "status" "analytics"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "result" JSONB DEFAULT '{}',
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_minute_features_brin_bucket" ON "analytics"."minute_features" USING BRIN ("bucket");

-- CreateIndex
CREATE INDEX "ix_minute_features_device_time" ON "analytics"."minute_features"("tenant_id", "device_id", "bucket" DESC);

-- CreateIndex
CREATE INDEX "ix_minute_features_metric_time" ON "analytics"."minute_features"("tenant_id", "metric", "bucket" DESC);

-- CreateIndex
CREATE INDEX "ix_minute_features_tags_gin" ON "analytics"."minute_features" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "minute_features_bucket_idx" ON "analytics"."minute_features"("bucket" DESC);

-- CreateIndex
CREATE INDEX "gin_dim_device_meta" ON "analytics"."dim_device" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "ix_dim_device_farm" ON "analytics"."dim_device"("tenant_id", "farm_id");

-- CreateIndex
CREATE INDEX "ix_dim_device_house" ON "analytics"."dim_device"("tenant_id", "house_id");

-- CreateIndex
CREATE INDEX "gin_dim_farm_meta" ON "analytics"."dim_farm" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "gin_dim_house_meta" ON "analytics"."dim_house" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "ix_dim_house_farm" ON "analytics"."dim_house"("tenant_id", "farm_id");

-- CreateIndex
CREATE INDEX "gin_dim_flock_meta" ON "analytics"."dim_flock" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "ix_dim_flock_farm" ON "analytics"."dim_flock"("tenant_id", "farm_id");

-- CreateIndex
CREATE INDEX "ix_dim_flock_house" ON "analytics"."dim_flock"("tenant_id", "house_id");

-- CreateIndex
CREATE INDEX "gin_dim_customer_meta" ON "analytics"."dim_customer" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "gin_dim_animal_type_meta" ON "analytics"."dim_animal_type" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "gin_dim_breed_meta" ON "analytics"."dim_breed" USING GIN ("meta");

-- CreateIndex
CREATE INDEX "ix_dim_breed_animal_type" ON "analytics"."dim_breed"("tenant_id", "animal_type_id");

-- CreateIndex
CREATE INDEX "analytics_agg_bucket_start_idx" ON "analytics"."analytics_agg"("bucket_start" DESC);

-- CreateIndex
CREATE INDEX "idx_agg_lookup" ON "analytics"."analytics_agg"("factory_id", "machine_id", "metric", "window_s", "bucket_start" DESC);

-- CreateIndex
CREATE INDEX "analytics_event_time_idx" ON "analytics"."analytics_event"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_event_lookup" ON "analytics"."analytics_event"("domain", "entity_type", "entity_id", "event_type", "time" DESC);

-- CreateIndex
CREATE INDEX "analytics_event_rollup_bucket_start_idx" ON "analytics"."analytics_event_rollup"("bucket_start" DESC);

-- CreateIndex
CREATE INDEX "idx_event_rollup_lookup" ON "analytics"."analytics_event_rollup"("domain", "entity_type", "entity_id", "event_type", "window_s", "bucket_start" DESC);

-- CreateIndex
CREATE INDEX "analytics_kpi_period_start_idx" ON "analytics"."analytics_kpi"("period_start" DESC);

-- CreateIndex
CREATE INDEX "idx_kpi_lookup" ON "analytics"."analytics_kpi"("factory_id", "machine_id", "metric", "period", "period_start" DESC);

-- CreateIndex
CREATE INDEX "analytics_anomaly_time_idx" ON "analytics"."analytics_anomaly"("time" DESC);

-- CreateIndex
CREATE INDEX "idx_anomaly_lookup" ON "analytics"."analytics_anomaly"("factory_id", "machine_id", "metric", "time" DESC);

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_metric_time" ON "analytics"."analytics_alerts"("metric", "alert_time");

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_resolved" ON "analytics"."analytics_alerts"("is_resolved", "created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_severity" ON "analytics"."analytics_alerts"("severity", "created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_tenant_factory_device" ON "analytics"."analytics_alerts"("tenant_id", "factory_id", "device_id");

-- CreateIndex
CREATE INDEX "idx_analytics_alerts_type" ON "analytics"."analytics_alerts"("alert_type", "created_at");

-- CreateIndex
CREATE INDEX "idx_spec_lookup" ON "analytics"."analytics_spec_limits"("factory_id", "machine_id", "metric");

-- CreateIndex
CREATE INDEX "ix_publog_bucket" ON "analytics"."feature_publish_log"("tenant_id", "bucket" DESC);

-- CreateIndex
CREATE INDEX "fcr_calculations_tenant_id_farm_id_house_id_flock_id_idx" ON "analytics"."fcr_calculations"("tenant_id", "farm_id", "house_id", "flock_id");

-- CreateIndex
CREATE INDEX "fcr_calculations_period_start_period_end_idx" ON "analytics"."fcr_calculations"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "fcr_calculations_fcr_value_idx" ON "analytics"."fcr_calculations"("fcr_value");

-- CreateIndex
CREATE INDEX "fcr_targets_tenant_id_farm_id_house_id_idx" ON "analytics"."fcr_targets"("tenant_id", "farm_id", "house_id");

-- CreateIndex
CREATE INDEX "fcr_targets_breed_idx" ON "analytics"."fcr_targets"("breed");

-- CreateIndex
CREATE INDEX "fcr_targets_is_active_idx" ON "analytics"."fcr_targets"("is_active");

-- CreateIndex
CREATE INDEX "size_distributions_tenant_id_farm_id_house_id_flock_id_idx" ON "analytics"."size_distributions"("tenant_id", "farm_id", "house_id", "flock_id");

-- CreateIndex
CREATE INDEX "size_distributions_measurement_date_idx" ON "analytics"."size_distributions"("measurement_date");

-- CreateIndex
CREATE INDEX "size_distributions_weight_class_idx" ON "analytics"."size_distributions"("weight_class");

-- CreateIndex
CREATE INDEX "prediction_models_tenant_id_model_type_idx" ON "analytics"."prediction_models"("tenant_id", "model_type");

-- CreateIndex
CREATE INDEX "prediction_models_status_idx" ON "analytics"."prediction_models"("status");

-- CreateIndex
CREATE INDEX "prediction_models_is_active_idx" ON "analytics"."prediction_models"("is_active");

-- CreateIndex
CREATE INDEX "predictions_tenant_id_model_id_idx" ON "analytics"."predictions"("tenant_id", "model_id");

-- CreateIndex
CREATE INDEX "predictions_prediction_type_target_date_idx" ON "analytics"."predictions"("prediction_type", "target_date");

-- CreateIndex
CREATE INDEX "predictions_farm_id_house_id_flock_id_idx" ON "analytics"."predictions"("farm_id", "house_id", "flock_id");

-- CreateIndex
CREATE INDEX "health_metrics_tenant_id_farm_id_house_id_flock_id_idx" ON "analytics"."health_metrics"("tenant_id", "farm_id", "house_id", "flock_id");

-- CreateIndex
CREATE INDEX "health_metrics_measurement_date_idx" ON "analytics"."health_metrics"("measurement_date");

-- CreateIndex
CREATE INDEX "production_metrics_tenant_id_farm_id_house_id_flock_id_idx" ON "analytics"."production_metrics"("tenant_id", "farm_id", "house_id", "flock_id");

-- CreateIndex
CREATE INDEX "production_metrics_period_start_period_end_idx" ON "analytics"."production_metrics"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "environmental_metrics_tenant_id_farm_id_house_id_device_id_idx" ON "analytics"."environmental_metrics"("tenant_id", "farm_id", "house_id", "device_id");

-- CreateIndex
CREATE INDEX "environmental_metrics_measurement_date_idx" ON "analytics"."environmental_metrics"("measurement_date");

-- CreateIndex
CREATE INDEX "analytics_configs_tenant_id_config_type_idx" ON "analytics"."analytics_configs"("tenant_id", "config_type");

-- CreateIndex
CREATE INDEX "analytics_configs_config_key_idx" ON "analytics"."analytics_configs"("config_key");

-- CreateIndex
CREATE INDEX "analytics_configs_is_active_idx" ON "analytics"."analytics_configs"("is_active");

-- CreateIndex
CREATE INDEX "analytics_jobs_tenant_id_job_type_idx" ON "analytics"."analytics_jobs"("tenant_id", "job_type");

-- CreateIndex
CREATE INDEX "analytics_jobs_status_idx" ON "analytics"."analytics_jobs"("status");

-- CreateIndex
CREATE INDEX "analytics_jobs_priority_idx" ON "analytics"."analytics_jobs"("priority");
