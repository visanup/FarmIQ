// src/services/featurePublisher.ts

import { prisma } from '../lib/prisma';
import { redis } from '../stores/redis';
import { producer } from '../utils/kafka';
import { env, topicOut } from '../configs/config';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

export async function publishFinalizedMinuteFeatures() {
  const rows: any[] = await prisma.$queryRaw(Prisma.sql`
    SELECT bucket, tenant_id, device_id, metric, value_count as count, value_sum as sum, value_min as min, value_max as max, value_sumsq as sumsq, tags
    FROM analytics.minute_features
    WHERE bucket < date_trunc('minute', now())
      AND bucket >= now() - interval '2 hour'
    ORDER BY bucket DESC
    LIMIT 2000
  `);
  if (!rows.length) return;

  const messages: { key: Buffer; value: Buffer }[] = [];

  // Build payloads and use Redis NX to deduplicate per bucket
  for (const r of rows) {
    const count = Number(r.count) || 0;
    const sum = Number(r.sum) || 0;
    const sumsq = Number(r.sumsq) || 0;
    const min = r.min != null ? Number(r.min) : null;
    const max = r.max != null ? Number(r.max) : null;

    const avg = count ? sum / count : 0;
    const variance = Math.max(0, (count ? sumsq / count : 0) - avg * avg);
    const stddev = Math.sqrt(variance);

    const tags = (r.tags as Record<string, unknown>) || {};
    const payload = {
      bucket: new Date(r.bucket).toISOString(),
      tenant_id: String(r.tenant_id),
      farm_id: (tags as any).farm_id ?? null,
      house_id: (tags as any).house_id ?? null,
      device_id: String(r.device_id),
      metric: String(r.metric),
      count,
      min,
      max,
      avg,
      stddev,
      window: '1m' as const,
    };

    const dedupKey = `feat:${payload.tenant_id}:${payload.device_id}:${payload.metric}:${payload.bucket}`;
    try {
      const ok = await redis.set(dedupKey, JSON.stringify(payload), 'EX', env.FEATURE_TTL_SECONDS, 'NX');
      if (ok === 'OK') {
        messages.push({
          key: Buffer.from(`${payload.tenant_id}:${payload.device_id}:${payload.metric}:${payload.bucket}`),
          value: Buffer.from(JSON.stringify(payload)),
        });
      }
    } catch (err) {
      logger.warn({ err, dedupKey }, 'feature-dedup-cache-failed');
      // ถ้า cache ล้มเหลว ให้ยังส่งต่อไปเพื่อไม่พลาดข้อมูล
      messages.push({
        key: Buffer.from(`${payload.tenant_id}:${payload.device_id}:${payload.metric}:${payload.bucket}`),
        value: Buffer.from(JSON.stringify(payload)),
      });
    }
  }

  if (!messages.length) return; // ทุกข้อความเคยส่งไปแล้ว

  await producer.send({ topic: topicOut, messages });
  logger.info({ published: messages.length, topic: topicOut }, '📤 published minute features');
}

