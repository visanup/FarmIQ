-- CreateTable
CREATE TABLE "edge_image"."media_objects" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmId" TEXT,
    "houseId" TEXT,
    "stationId" TEXT,
    "sensorId" TEXT,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "metadata" JSONB,
    "time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edge_image"."reading_media_map" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "readingId" TEXT NOT NULL,
    "deltaMs" INTEGER NOT NULL,
    "strategy" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_media_map_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_objects_mediaId_key" ON "edge_image"."media_objects"("mediaId");

-- CreateIndex
CREATE INDEX "media_objects_tenantId_time_idx" ON "edge_image"."media_objects"("tenantId", "time");

-- CreateIndex
CREATE INDEX "media_objects_bucket_objectKey_idx" ON "edge_image"."media_objects"("bucket", "objectKey");

-- CreateIndex
CREATE INDEX "media_objects_mediaId_idx" ON "edge_image"."media_objects"("mediaId");

-- CreateIndex
CREATE INDEX "reading_media_map_mediaId_idx" ON "edge_image"."reading_media_map"("mediaId");

-- CreateIndex
CREATE INDEX "reading_media_map_readingId_idx" ON "edge_image"."reading_media_map"("readingId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_media_map_mediaId_readingId_key" ON "edge_image"."reading_media_map"("mediaId", "readingId");
