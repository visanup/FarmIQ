// src/services/readingMediaMap.service.ts

import { AppDataSource } from '../utils/dataSource';
import { ReadingMediaMap } from '../models/ReadingMediaMap';
import { Repository, QueryRunner } from 'typeorm';
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

/** Get repository, optionally from provided QueryRunner (for transactions) */
function repo({ qr }: EnsureRepoOpts = {}): Repository<ReadingMediaMap> {
  const manager = qr?.manager ?? AppDataSource.manager;
  return manager.getRepository(ReadingMediaMap);
}

/** Normalize Zod-validated input into entity fields */
function normalize(input: ReadingLinkInput): Partial<ReadingMediaMap> {
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
function whereExact(q: ReturnType<Repository<ReadingMediaMap>['createQueryBuilder']>, alias: string, n: Partial<ReadingMediaMap>) {
  q.where(`${alias}.time = :time`, { time: n.time })
    .andWhere(`${alias}.tenant_id = :tenant_id`, { tenant_id: n.tenant_id })
    .andWhere(n.robot_id == null ? `${alias}.robot_id IS NULL` : `${alias}.robot_id = :robot_id`, { robot_id: n.robot_id ?? undefined })
    .andWhere(n.station_id == null ? `${alias}.station_id IS NULL` : `${alias}.station_id = :station_id`, { station_id: n.station_id ?? undefined })
    .andWhere(n.sensor_id == null ? `${alias}.sensor_id IS NULL` : `${alias}.sensor_id = :sensor_id`, { sensor_id: n.sensor_id ?? undefined })
    .andWhere(`${alias}.metric = :metric`, { metric: n.metric })
    .andWhere(`${alias}.media_id = :media_id`, { media_id: n.media_id });
  return q;
}

/** Upsert (INSERT … ON CONFLICT DO NOTHING by unique constraint), then return the row */
export async function upsertReadingLink(input: ReadingLinkInput, opts: EnsureRepoOpts = {}): Promise<ReadingMediaMap> {
  const parsed = ReadingLinkSchema.parse(input);
  const n = normalize(parsed);

  const r = repo(opts);

  // Try insert with ON CONFLICT DO NOTHING (Postgres)
  await r
    .createQueryBuilder()
    .insert()
    .into(ReadingMediaMap)
    .values(n)
    .onConflict('ON CONSTRAINT uq_reading_media_map_norm DO NOTHING')
    .execute();

  // Select the row (either newly inserted or existing)
  const q = r.createQueryBuilder('m');
  whereExact(q, 'm', n);
  const found = await q.getOne();
  if (!found) {
    // This shouldn't happen; throw to expose logical errors if any.
    throw new Error('Failed to upsert/fetch ReadingMediaMap row');
  }
  return found;
}

/** Create (fail if duplicate). Use this if you expect no conflict and want error on dup. */
export async function createReadingLink(input: ReadingLinkInput, opts: EnsureRepoOpts = {}) {
  const parsed = ReadingLinkSchema.parse(input);
  const n = normalize(parsed);
  return await repo(opts).save(repo(opts).create(n));
}

/** Bulk upsert with optional transaction (default true) */
export async function bulkUpsertReadingLinks(inputs: ReadingLinkInput[], useTransaction = true): Promise<ReadingMediaMap[]> {
  if (!useTransaction) {
    const out: ReadingMediaMap[] = [];
    for (const i of inputs) out.push(await upsertReadingLink(i));
    return out;
  }

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const out: ReadingMediaMap[] = [];
    for (const i of inputs) out.push(await upsertReadingLink(i, { qr }));
    await qr.commitTransaction();
    return out;
  } catch (e) {
    await qr.rollbackTransaction();
    throw e;
  } finally {
    await qr.release();
  }
}

/** Query: recent by tenant (default limit 50) */
export async function findRecentByTenant(tenant_id: string, limit = 50) {
  return await repo()
    .createQueryBuilder('m')
    .where('m.tenant_id = :tenant_id', { tenant_id })
    .orderBy('m.time', 'DESC')
    .limit(limit)
    .getMany();
}

/** Query: by media_id */
export async function findByMediaId(media_id: string) {
  return await repo()
    .createQueryBuilder('m')
    .where('m.media_id = :media_id', { media_id: String(media_id) })
    .orderBy('m.time', 'DESC')
    .getMany();
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
  const qb = repo().createQueryBuilder('m').where('m.tenant_id = :tenant_id', { tenant_id: params.tenant_id });

  if (params.station_id !== undefined) {
    params.station_id == null ? qb.andWhere('m.station_id IS NULL') : qb.andWhere('m.station_id = :station_id', { station_id: params.station_id });
  }
  if (params.sensor_id !== undefined) {
    params.sensor_id == null ? qb.andWhere('m.sensor_id IS NULL') : qb.andWhere('m.sensor_id = :sensor_id', { sensor_id: params.sensor_id });
  }
  if (params.metric) qb.andWhere('m.metric = :metric', { metric: params.metric });
  if (params.from) qb.andWhere('m.time >= :from', { from: typeof params.from === 'string' ? new Date(params.from) : params.from });
  if (params.to) qb.andWhere('m.time <= :to', { to: typeof params.to === 'string' ? new Date(params.to) : params.to });

  qb.orderBy('m.time', 'DESC').limit(params.limit ?? 100);

  return await qb.getMany();
}

/** Delete by map_id */
export async function deleteByMapId(map_id: string, opts: EnsureRepoOpts = {}) {
  await repo(opts).delete({ map_id: String(map_id) } as any);
}

/** Delete all links for a media_id (when a media is removed) */
export async function deleteByMediaId(media_id: string, opts: EnsureRepoOpts = {}) {
  await repo(opts)
    .createQueryBuilder()
    .delete()
    .from(ReadingMediaMap)
    .where('media_id = :media_id', { media_id: String(media_id) })
    .execute();
}
