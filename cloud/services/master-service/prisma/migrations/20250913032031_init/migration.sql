-- CreateTable
CREATE TABLE "master"."customers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."farms" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" JSONB,
    "region" TEXT,
    "farm_type" TEXT,
    "total_area" INTEGER,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."houses" (
    "id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "capacity" INTEGER,
    "dimensions" JSONB,
    "ventilation" TEXT,
    "heating" TEXT,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."devices" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT,
    "vendor" TEXT,
    "serial_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" JSONB,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."animal_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."breeds" (
    "id" TEXT NOT NULL,
    "animal_type_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "characteristics" JSONB,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."flocks" (
    "id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT,
    "animal_type_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "population" INTEGER NOT NULL,
    "sex" TEXT,
    "source_farm" TEXT,
    "vaccination_status" TEXT,
    "feed_type" TEXT,
    "health_status" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."device_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "specifications" JSONB,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."sensor_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "data_type" TEXT,
    "range" JSONB,
    "description" TEXT,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."feed_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "composition" JSONB,
    "energy" DECIMAL(10,4),
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."formulas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "composition" JSONB,
    "energy" DECIMAL(10,4),
    "cost" DECIMAL(10,4),
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."economic_data" (
    "id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "region" TEXT,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT,
    "currency" TEXT DEFAULT 'THB',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."external_data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "api_url" TEXT,
    "api_key" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."zones" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT,
    "name" TEXT NOT NULL,
    "geometry" JSONB,
    "type" TEXT,
    "capacity" INTEGER,
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."stations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "house_id" TEXT,
    "name" TEXT NOT NULL,
    "location" JSONB,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."device_health" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "battery_level" INTEGER,
    "signal_strength" INTEGER,
    "temperature" DECIMAL(5,2),
    "errors" TEXT[],
    "warnings" TEXT[],
    "meta" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master"."master_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "data" JSONB,
    "metadata" JSONB DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_key" ON "master"."customers"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "master"."customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "farms_farm_id_key" ON "master"."farms"("farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "farms_tenant_id_farm_id_key" ON "master"."farms"("tenant_id", "farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "houses_house_id_key" ON "master"."houses"("house_id");

-- CreateIndex
CREATE UNIQUE INDEX "houses_tenant_id_farm_id_house_id_key" ON "master"."houses"("tenant_id", "farm_id", "house_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_key" ON "master"."devices"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_no_key" ON "master"."devices"("serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "devices_tenant_id_farm_id_house_id_device_id_key" ON "master"."devices"("tenant_id", "farm_id", "house_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "animal_types_name_key" ON "master"."animal_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_animal_type_id_name_key" ON "master"."breeds"("animal_type_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "flocks_flock_id_key" ON "master"."flocks"("flock_id");

-- CreateIndex
CREATE UNIQUE INDEX "flocks_tenant_id_farm_id_flock_id_key" ON "master"."flocks"("tenant_id", "farm_id", "flock_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_types_name_key" ON "master"."device_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_types_name_key" ON "master"."sensor_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feed_types_name_key" ON "master"."feed_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_name_key" ON "master"."formulas"("name");

-- CreateIndex
CREATE INDEX "economic_data_data_type_region_timestamp_idx" ON "master"."economic_data"("data_type", "region", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "external_data_sources_name_key" ON "master"."external_data_sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zones_tenant_id_farm_id_name_key" ON "master"."zones"("tenant_id", "farm_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "stations_tenant_id_farm_id_name_key" ON "master"."stations"("tenant_id", "farm_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "device_health_device_id_key" ON "master"."device_health"("device_id");

-- CreateIndex
CREATE INDEX "master_events_event_type_entity_type_timestamp_idx" ON "master"."master_events"("event_type", "entity_type", "timestamp");

-- CreateIndex
CREATE INDEX "master_events_tenant_id_timestamp_idx" ON "master"."master_events"("tenant_id", "timestamp");

-- AddForeignKey
ALTER TABLE "master"."farms" ADD CONSTRAINT "farms_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "master"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."houses" ADD CONSTRAINT "houses_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "master"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."devices" ADD CONSTRAINT "devices_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "master"."houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."breeds" ADD CONSTRAINT "breeds_animal_type_id_fkey" FOREIGN KEY ("animal_type_id") REFERENCES "master"."animal_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."flocks" ADD CONSTRAINT "flocks_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "master"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."flocks" ADD CONSTRAINT "flocks_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "master"."houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."flocks" ADD CONSTRAINT "flocks_animal_type_id_fkey" FOREIGN KEY ("animal_type_id") REFERENCES "master"."animal_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master"."flocks" ADD CONSTRAINT "flocks_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "master"."breeds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
