// src/services/readingMediaMap.service.ts

import { prisma } from '../utils/prisma';
// removed typeorm remnants
type QueryRunner = any; type Repository<T> = any;
import { z } from 'zod';

/** ---------- Zod schema + input types ---------- */
export const ReadingLinkSchema = z.object({
  time: z
    .union([z.string(), z.date()])
    .transform((v) => (typeof v === 'string' ? new Date(v) : v)),
  tenant_id: z.string().min(1),
  robot_id: z.string().nullish(),
  run_id: z.union([z.string(), z.number()]).nullish().transform((v) => (v == null ? null : String(v))),
  station_id: z.string().nullish(),
  sensor_id: z.string().nullish(),
  metric: z.string().min(1),
  media_id: z.union([z.string(), z.number()]).transform((v) => String(v)),
});

export type ReadingLinkInput = z.infer<typeof ReadingLinkSchema>;

type EnsureRepoOpts = { qr?: QueryRunner };

// After Prisma migration, provide minimal replacements using raw SQL
async function insertIfNotExists(n: any) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.reading_media_map (time, tenant_id, robot_id, run_id, station_id, sensor_id, metric, media_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT ON CONSTRAINT uq_reading_media_map_norm DO NOTHING`,
    n.time, n.tenant_id, n.robot_id ?? null, n.run_id ?? null, n.station_id ?? null, n.sensor_id ?? null, n.metric, n.media_id
  );
}

/** Normalize Zod-validated input into entity fields */
function normalize(input: ReadingLinkInput): any {
  return {
    time: input.time,
    tenant_id: input.tenant_id,
    robot_id: input.robot_id ?? null,
    run_id: input.run_id ?? null,
    station_id: input.station_id ?? null,
    sensor_id: input.sensor_id ?? null,
    metric: input.metric,
    media_id: input.media_id,
  };
}

/** Build WHERE clause to match the same “unique key” (coalesce-null behavior) */
function whereExact(_q: any, _alias: string, _n: any) {
  return _q;
}

/** Upsert (INSERT … ON CONFLICT DO NOTHING by unique constraint), then return the row */
export async function upsertReadingLink(input: ReadingLinkInput, _opts: EnsureRepoOpts = {}): Promise<any> {
  const parsed = ReadingLinkSchema.parse(input);
  const n = normalize(parsed);
  await insertIfNotExists(n);
  const rows = await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.reading_media_map
     WHERE time=$1 AND tenant_id=$2 AND COALESCE(robot_id,'-') = COALESCE($3,'-')
       AND COALESCE(station_id,'-') = COALESCE($4,'-')
       AND COALESCE(sensor_id,'-') = COALESCE($5,'-')
       AND metric=$6 AND media_id=$7
     ORDER BY time DESC LIMIT 1`,
    n.time, n.tenant_id, n.robot_id ?? null, n.station_id ?? null, n.sensor_id ?? null, n.metric, n.media_id
  ) as Promise<any[]>);
  if (!rows[0]) throw new Error('Failed to upsert/fetch ReadingMediaMap row');
  return rows[0];
}

/** Create (fail if duplicate). Use this if you expect no conflict and want error on dup. */
export async function createReadingLink(input: ReadingLinkInput) {
  const parsed = ReadingLinkSchema.parse(input);
  const n = normalize(parsed);
  await prisma.$executeRawUnsafe(
    `INSERT INTO sensors.reading_media_map (time, tenant_id, robot_id, run_id, station_id, sensor_id, metric, media_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    n.time, n.tenant_id, n.robot_id ?? null, n.run_id ?? null, n.station_id ?? null, n.sensor_id ?? null, n.metric, n.media_id
  );
  return n;
}

/** Bulk upsert with optional transaction (default true) */
export async function bulkUpsertReadingLinks(inputs: ReadingLinkInput[], useTransaction = true): Promise<any[]> {
  if (!useTransaction) {
    const out: any[] = [];
    for (const i of inputs) out.push(await upsertReadingLink(i));
    return out;
  }
  return await prisma.$transaction(async (tx: any) => {
    const out: any[] = [];
    for (const i of inputs) {
      const n = normalize(ReadingLinkSchema.parse(i));
      await tx.$executeRawUnsafe(
        `INSERT INTO sensors.reading_media_map (time, tenant_id, robot_id, run_id, station_id, sensor_id, metric, media_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT ON CONSTRAINT uq_reading_media_map_norm DO NOTHING`,
        n.time, n.tenant_id, n.robot_id ?? null, n.run_id ?? null, n.station_id ?? null, n.sensor_id ?? null, n.metric, n.media_id
      );
      out.push(n);
    }
    return out;
  });
}

/** Query: recent by tenant (default limit 50) */
export async function findRecentByTenant(tenant_id: string, limit = 50) {
  return await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.reading_media_map WHERE tenant_id=$1 ORDER BY time DESC LIMIT $2`,
    tenant_id, limit
  ) as Promise<any[]>);
}

/** Query: by media_id */
export async function findByMediaId(media_id: string) {
  return await (prisma.$queryRawUnsafe(
    `SELECT * FROM sensors.reading_media_map WHERE media_id=$1 ORDER BY time DESC`,
    String(media_id)
  ) as Promise<any[]>);
}

/** Flexible filter: by tenant + optional station/sensor/metric + time range */
export async function listByFilter(params: {
  tenant_id: string;
  station_id?: string | null;
  sensor_id?: string | null;
  metric?: string;
  from?: Date | string;
  to?: Date | string;
  limit?: number;
}) {
  const conds: string[] = ["tenant_id = $1"]; const args: any[] = [params.tenant_id];
  let i = 2;
  if (params.station_id !== undefined) { conds.push(params.station_id == null ? 'station_id IS NULL' : `station_id = $${i++}`); if (params.station_id != null) args.push(params.station_id); }
  if (params.sensor_id !== undefined) { conds.push(params.sensor_id == null ? 'sensor_id IS NULL' : `sensor_id = $${i++}`); if (params.sensor_id != null) args.push(params.sensor_id); }
  if (params.metric) { conds.push(`metric = $${i++}`); args.push(params.metric); }
  if (params.from) { conds.push(`time >= $${i++}`); args.push(typeof params.from === 'string' ? new Date(params.from) : params.from); }
  if (params.to) { conds.push(`time <= $${i++}`); args.push(typeof params.to === 'string' ? new Date(params.to) : params.to); }
  const limit = params.limit ?? 100; args.push(limit);
  const sql = `SELECT * FROM sensors.reading_media_map WHERE ${conds.join(' AND ')} ORDER BY time DESC LIMIT $${i}`;
  return await (prisma.$queryRawUnsafe(sql, ...args) as Promise<any[]>);
}

/** Delete by map_id */
export async function deleteByMapId(map_id: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM sensors.reading_media_map WHERE map_id=$1`, String(map_id));
}

/** Delete all links for a media_id (when a media is removed) */
export async function deleteByMediaId(media_id: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM sensors.reading_media_map WHERE media_id=$1`, String(media_id));
}
