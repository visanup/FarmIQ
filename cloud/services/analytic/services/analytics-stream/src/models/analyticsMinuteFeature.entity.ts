import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

/** Hypertable: analytics_minute_features */
@Entity({ name: 'analytics_minute_features', schema: "analytics" })
@Index(['tenant_id', 'device_id', 'metric', 'bucket'])
export class AnalyticsMinuteFeature {
  @PrimaryColumn({ type: 'timestamptz' })
  bucket!: Date;

  @PrimaryColumn({ type: 'text' })
  tenant_id!: string;

  @PrimaryColumn({ type: 'text' })
  device_id!: string;

  @PrimaryColumn({ type: 'text' })
  metric!: string;

  // ใช้ number ก็พอ (จำนวนต่อ 1 นาที/อุปกรณ์ ไม่ทะลุ 2^53 ง่าย ๆ)
  @Column({ type: 'bigint', default: () => '0', transformer: {
    to: (v?: number) => v,
    from: (v: string | null) => (v == null ? 0 : Number(v))
  }})
  count!: number;

  @Column({ type: 'double precision', default: () => '0' })
  sum!: number;

  @Column({ type: 'double precision' })
  min!: number;

  @Column({ type: 'double precision' })
  max!: number;

  @Column({ type: 'double precision', default: () => '0' })
  sumsq!: number;
}
