// services/formula-service/src/models/formula.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FormulaComposition } from '../models/formulaComposition.model';
import { FormulaEnergy } from '../models/formulaEnergy.model';
import { FormulaNutrition } from '../models/formulaNutrition.model';
import { FormulaAdditional } from '../models/formulaAdditional.model';

@Entity({ schema: 'formulas', name: 'formula' })
export class Formula {
  @PrimaryGeneratedColumn({ name: 'formula_id' })
  formulaId!: number;

  @Column({ name: 'formula_no', type: 'varchar', length: 50 })
  formulaNo!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => FormulaComposition, (composition: FormulaComposition) => composition.formula, {
    cascade: true,
  })
  compositions!: FormulaComposition[];

  @OneToMany(() => FormulaEnergy, (energy: FormulaEnergy) => energy.formula, { cascade: true })
  energies!: FormulaEnergy[];

  @OneToMany(() => FormulaNutrition, (nutrition: FormulaNutrition) => nutrition.formula, {
    cascade: true,
  })
  nutritions!: FormulaNutrition[];

  @OneToMany(() => FormulaAdditional, (additional: FormulaAdditional) => additional.formula, {
    cascade: true,
  })
  additionals!: FormulaAdditional[];
}

