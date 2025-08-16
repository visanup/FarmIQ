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
  return { media, reading, deltaMs };
}