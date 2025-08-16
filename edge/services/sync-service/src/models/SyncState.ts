// src/models/SyncState.ts
import { Entity, PrimaryColumn, Column } from "typeorm";
@Entity({ name: "sync_state" })
export class SyncState {
  @PrimaryColumn("text") table_name!: string;
  @Column("timestamptz", { default: () => "to_timestamp(0)" }) last_ts!: Date;
}
