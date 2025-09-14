// src/stores/analyticsFeature.repo.ts

import { prisma } from '../lib/prisma';
import { BaseReading } from '../types/events';

const UPSERT_SQL = `
INSERT INTO analytics.minute_features AS t
  (bucket, tenant_id, device_id, sensor_id, metric, tags, value_count, value_sum, value_min, value_max, value_sumsq)
VALUES ($1,$2,$3,$4,$5,$6,1,$7,$7,$7,$8)
ON CONFLICT (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
DO UPDATE SET
  value_count = t.value_count + 1,
  value_sum   = t.value_sum   + EXCLUDED.value_sum,
  value_min   = LEAST(t.value_min, EXCLUDED.value_min),
  value_max   = GREATEST(t.value_max, EXCLUDED.value_max),
  value_sumsq = t.value_sumsq + EXCLUDED.value_sumsq
`;

export async function upsertMinuteFeature(ev: BaseReading) {
  const t = new Date(Math.floor(ev.time.getTime() / 60000) * 60000); // ปัดลงเป็นนาที
  const v = ev.value;
  
  // ✅ Validate and ensure non-null values
  if (v === null || v === undefined || !isFinite(v)) {
    console.warn('⚠️ Invalid value for upsertMinuteFeature:', { value: v, ev });
    return; // Skip invalid values
  }
  
  const vSquared = v * v;
  const sensorId = ev.sensor_id || '';
  const tags = ev.tags || {};
  
  // ✅ Calculate tags_hash (simple hash of JSON string)
  const tagsJson = JSON.stringify(tags);
  const tagsHash = require('crypto').createHash('md5').update(tagsJson).digest('hex');

  try {
    await prisma.$executeRaw`
      INSERT INTO analytics.minute_features AS t
        (bucket, tenant_id, device_id, sensor_id, metric, tags, tags_hash, value_count, value_sum, value_min, value_max, value_sumsq)
      VALUES (${t}, ${ev.tenant_id}, ${ev.device_id}, ${sensorId}, ${ev.metric}, ${tags}::jsonb, ${tagsHash}, 1, ${v}, ${v}, ${v}, ${vSquared})
      ON CONFLICT (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
      DO UPDATE SET
        value_count = t.value_count + 1,
        value_sum   = t.value_sum   + EXCLUDED.value_sum,
        value_min   = LEAST(t.value_min, EXCLUDED.value_min),
        value_max   = GREATEST(t.value_max, EXCLUDED.value_max),
        value_sumsq = t.value_sumsq + EXCLUDED.value_sumsq
    `;
  } catch (error) {
    console.error('❌ Failed to upsert minute feature:', {
      error: error instanceof Error ? error.message : String(error),
      data: { t, tenant_id: ev.tenant_id, device_id: ev.device_id, sensor_id: sensorId, metric: ev.metric, value: v, tags_hash: tagsHash }
    });
    throw error;
  }
}


