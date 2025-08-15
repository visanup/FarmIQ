// services/formula-service/src/models/formulaEnergy.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Formula } from './formula.model';

@Entity({ schema: 'formulas', name: 'formula_energy' })
export class FormulaEnergy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'formula_id' })
  formulaId!: number;

  @Column({ name: 'energy_type', type: 'varchar', length: 100 })
  energyType!: string;

  @Column({ type: 'numeric' })
  value!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relation to Formula
  @ManyToOne(() => Formula, (formula: Formula) => formula.energies, {
  onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'formula_id' })
  formula!: Formula;
}
