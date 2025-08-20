import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({ name: 'analytics_5m', schema: 'analytics' })
export class Analytics5mView {
  @ViewColumn({ name: 'bucket' })
  bucket!: Date;

  @ViewColumn()
  tenant_id!: string;

  @ViewColumn()
  device_id!: string;

  @ViewColumn()
  metric!: string;

  @ViewColumn()
  count!: number;

  @ViewColumn()
  sum!: number;

  @ViewColumn()
  min!: number;

  @ViewColumn()
  max!: number;

  @ViewColumn()
  sumsq!: number;
}

@ViewEntity({ name: 'analytics_1h', schema: 'analytics' })
export class Analytics1hView {
  @ViewColumn({ name: 'bucket' })
  bucket!: Date;

  @ViewColumn()
  tenant_id!: string;

  @ViewColumn()
  device_id!: string;

  @ViewColumn()
  metric!: string;

  @ViewColumn()
  count!: number;

  @ViewColumn()
  sum!: number;

  @ViewColumn()
  min!: number;

  @ViewColumn()
  max!: number;

  @ViewColumn()
  sumsq!: number;
}
