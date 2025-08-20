// src/stores/analyticsFeature.repo.ts

import { AppDataSource } from '../utils/dataSource';
import { BaseReading } from '../types/events';

const UPSERT_SQL = `
INSERT INTO analytics.analytics_minute_features AS t
  (bucket, tenant_id, device_id, metric, count, sum, min, max, sumsq)
VALUES ($1,$2,$3,$4,1,$5,$5,$5,$6)
ON CONFLICT (bucket, tenant_id, device_id, metric)
DO UPDATE SET
  count = t.count + 1,
  sum   = t.sum   + EXCLUDED.sum,
  min   = LEAST(t.min, EXCLUDED.min),
  max   = GREATEST(t.max, EXCLUDED.max),
  sumsq = t.sumsq + EXCLUDED.sumsq
`;

export async function upsertMinuteFeature(ev: BaseReading) {
  const t = new Date(Math.floor(ev.time.getTime() / 60000) * 60000); // ปัดลงเป็นนาที
  const v = ev.value;
  await AppDataSource.query(UPSERT_SQL, [t, ev.tenant_id, ev.device_id, ev.metric, v, v * v]);
}


