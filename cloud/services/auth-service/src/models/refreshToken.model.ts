// src/models/refreshToken.model.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

@Entity({ schema: 'auth', name: 'user_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  token_id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  refresh_token!: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  issued_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ nullable: true })
  device_info?: string;
}

