// src/models/feedIntake.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'farms', name: 'feed_intake' })
export class FeedIntake {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  farm_id!: number;

  @Column({ nullable: true })
  animal_id?: number;

  @Column('numeric')
  feed_quantity!: number;

  @Column({ nullable: true })
  feed_batch_id?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}