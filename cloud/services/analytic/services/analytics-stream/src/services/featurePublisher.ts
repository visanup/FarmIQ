// src/services/featurePublisher.ts

import { AppDataSource } from '../utils/dataSource';
import { redis } from '../stores/redis';
import { producer } from '../utils/kafka';
import { env, topicOut } from '../configs/config';
import { logger } from '../utils/logger';

const SELECT_FINALIZED = `
SELECT bucket, tenant_id, device_id, metric, count, sum, min, max, sumsq
FROM analytics.analytics_minute_features
WHERE bucket < date_trunc('minute', now())
  AND bucket >= now() - interval '2 hour'
ORDER BY bucket DESC
LIMIT 2000;
`;

export async function publishFinalizedMinuteFeatures() {
  const rows: any[] = await AppDataSource.query(SELECT_FINALIZED);
  if (!rows.length) return;

  const msgs = rows.map((r) => {
    const count = Number(r.count) || 0;
    const avg = count ? r.sum / count : 0;
    const variance = Math.max(0, (count ? r.sumsq / count : 0) - avg * avg);
    const stddev = Math.sqrt(variance);

    const payload = {
      bucket: new Date(r.bucket).toISOString(),
      tenant_id: r.tenant_id,
      device_id: r.device_id,
      metric: r.metric,
      count,
      min: r.min,
      max: r.max,
      avg,
      stddev,
      window: '1m'
    };

    const key = `feat:${payload.tenant_id}:${payload.device_id}:${payload.metric}:${payload.bucket}`;
    void redis.setex(key, env.FEATURE_TTL_SECONDS, JSON.stringify(payload));

    return {
      key: Buffer.from(`${payload.tenant_id}:${payload.device_id}:${payload.metric}`),
      value: Buffer.from(JSON.stringify(payload))
    };
  });

  await producer.send({ topic: topicOut, messages: msgs });
  logger.info({ published: msgs.length, topic: topicOut }, '📤 published minute features');
}


