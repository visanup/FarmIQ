// src/services/associate.service.ts

import { ASSOC_WINDOW_MS } from '../configs/config';
import { resolveMedia } from './media.service';
import { createAssociation } from './readingMediaMap.service';
import { AssociateRequestT, ImageCreatedEventT } from '../schemas/ingestion.schemas';
import { findNearestWeightReading } from './reading.service';

export async function associateFromRequest(req: AssociateRequestT) {
  // ✅ ส่งเฉพาะคีย์ที่อยู่ใน MediaRef
  const media = await resolveMedia({
    media_id: req.media_id,
    bucket: req.bucket,
    object_key: req.object_key,
  });

  const result = await findNearestWeightReading(
    media.tenant_id,
    media.sensor_id ?? null,
    media.time,
    req.window_ms ?? ASSOC_WINDOW_MS
  );
  if (!result) throw new Error('No reading found in window');

  const { reading, deltaMs } = result;
  await createAssociation(media.mediaId, reading.id, deltaMs, 'nearest', null);
  return { media, reading, deltaMs };
}

export async function handleImageCreated(ev: ImageCreatedEventT) {
  // ✅ ตรงนี้เอา window_ms ออกให้หมด
  const media = await resolveMedia({ media_id: ev.media_id });

  const result = await findNearestWeightReading(
    media.tenant_id,
    media.sensor_id ?? null,
    media.time,
    ASSOC_WINDOW_MS
  );
  if (!result) throw new Error('No reading found in window');

  const { reading, deltaMs } = result;
  await createAssociation(media.mediaId, reading.id, deltaMs, 'nearest', null);
  
  // Create lab reading for weight association
  await createLabReadingFromWeightAssociation(media, reading, deltaMs);
  
  return { media, reading, deltaMs };
}

// Create lab reading from weight association for cloud sync
async function createLabReadingFromWeightAssociation(
  media: any, 
  reading: any, 
  deltaMs: number
) {
  const { prisma } = await import('../utils/prisma');
  
  const labReading = {
    sampleId: `lab_${media.tenant_id}_${media.mediaId}_${Date.now()}`,
    farmId: media.tenant_id, // Use tenant_id as farmId fallback
    testType: 'weight_measurement',
    value: reading.value,
    unit: 'kg',
    result: 'PASS', // Weight measurements are typically considered passed
    metadata: {
      tenantId: media.tenant_id,
      farmId: media.tenant_id,
      houseId: media.station_id,
      stationId: media.station_id,
      sensorId: media.sensor_id,
      mediaId: media.mediaId,
      readingId: reading.id,
      deltaMs: deltaMs,
      strategy: 'nearest',
      matchWindowMs: ASSOC_WINDOW_MS,
      generatedAt: new Date().toISOString()
    },
    timestamp: media.time
  };

  // Insert into lab_readings table for sync service
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.lab_readings 
     (sample_id, farm_id, test_type, value, unit, result, metadata, time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (sample_id, test_type, time) 
     DO UPDATE SET value=EXCLUDED.value, metadata=EXCLUDED.metadata`,
    labReading.sampleId,
    labReading.farmId,
    labReading.testType,
    labReading.value,
    labReading.unit,
    labReading.result,
    JSON.stringify(labReading.metadata),
    labReading.timestamp
  );
}