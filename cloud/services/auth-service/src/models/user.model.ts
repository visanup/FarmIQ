// services/auth-service/src/models/user.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ nullable: true })
  customer_id?: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password_hash!: string;

  @Column({ default: 'user' })
  role!: string;

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
