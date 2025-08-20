// src/models/migrations/1723950000000_init_analytics.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class initAnalytics1723950000000 implements MigrationInterface {
  name = 'initAnalytics1723950000000';
  // ถ้าต้องการให้ migration นี้ไม่อยู่ใน TX เลย ให้ปลดคอมเมนต์
  // public transaction = 'none' as const;

  public async up(q: QueryRunner): Promise<void> {
    const S = 'analytics';
    const T = `${S}.analytics_minute_features`;
    const V5 = `${S}.analytics_5m`;
    const V1 = `${S}.analytics_1h`;

    await q.query(`CREATE SCHEMA IF NOT EXISTS ${S};`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS ${T}(
        bucket      TIMESTAMPTZ NOT NULL,
        tenant_id   TEXT NOT NULL,
        device_id   TEXT NOT NULL,
        metric      TEXT NOT NULL,
        count       BIGINT NOT NULL DEFAULT 0,
        sum         DOUBLE PRECISION NOT NULL DEFAULT 0,
        min         DOUBLE PRECISION NOT NULL,
        max         DOUBLE PRECISION NOT NULL,
        sumsq       DOUBLE PRECISION NOT NULL DEFAULT 0,
        PRIMARY KEY (bucket, tenant_id, device_id, metric)
      );
    `);

    await q.query(`
      SELECT create_hypertable('${T}','bucket', if_not_exists => TRUE);
    `);

    // === Continuous Aggregates (WITH NO DATA เพื่อหลบ TX error) ===
    await q.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${V5}
      WITH (timescaledb.continuous) AS
      SELECT time_bucket('5 minutes', bucket) AS bucket,
             tenant_id, device_id, metric,
             sum(count) AS count,
             sum(sum)   AS sum,
             min(min)   AS min,
             max(max)   AS max,
             sum(sumsq) AS sumsq
      FROM ${T}
      GROUP BY 1,2,3,4
      WITH NO DATA;
    `);

    await q.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${V1}
      WITH (timescaledb.continuous) AS
      SELECT time_bucket('1 hour', bucket) AS bucket,
             tenant_id, device_id, metric,
             sum(count) AS count,
             sum(sum)   AS sum,
             min(min)   AS min,
             max(max)   AS max,
             sum(sumsq) AS sumsq
      FROM ${T}
      GROUP BY 1,2,3,4
      WITH NO DATA;
    `);

    // ... โค้ดสร้าง schema/table/hypertable/materialized view (WITH NO DATA) เหมือนเดิม

    // === Policies (ห่อด้วย DO $$ เพื่อกันซ้ำ) ===
    await q.query(`
      DO $$
      BEGIN
        PERFORM add_continuous_aggregate_policy('analytics.analytics_5m',
          start_offset => INTERVAL '2 hours',
          end_offset   => INTERVAL '5 minutes',
          schedule_interval => INTERVAL '1 minute');
      EXCEPTION
        WHEN duplicate_object THEN
          -- policy นี้มีอยู่แล้ว ข้ามไป
          NULL;
      END $$;
      `);

          await q.query(`
      DO $$
      BEGIN
        PERFORM add_continuous_aggregate_policy('analytics.analytics_1h',
          start_offset => INTERVAL '48 hours',
          end_offset   => INTERVAL '1 hour',
          schedule_interval => INTERVAL '15 minutes');
      EXCEPTION
        WHEN duplicate_object THEN
          NULL;
      END $$;
      `);
  }

  public async down(q: QueryRunner): Promise<void> {
    const S = 'analytics';
    const T = `${S}.analytics_minute_features`;
    const V5 = `${S}.analytics_5m`;
    const V1 = `${S}.analytics_1h`;

    await q.query(`DROP MATERIALIZED VIEW IF EXISTS ${V5};`);
    await q.query(`DROP MATERIALIZED VIEW IF EXISTS ${V1};`);
    await q.query(`DROP TABLE IF EXISTS ${T};`);
    // ไม่ drop schema เพื่อความปลอดภัยของของอย่างอื่นใน analytics
  }
}

