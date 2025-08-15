// services/formula-service/src/routes/index.ts
import { Router } from 'express';

import formulaRouter from './formula.route';
import formulaCompositionRouter from './formulaComposition.route';
import formulaEnergyRouter from './formulaEnergy.route';
import formulaNutritionRouter from './formulaNutrition.route';
import formulaAdditionalRouter from './formulaAdditional.route';

const router = Router();

router.use('/formulas', formulaRouter);
router.use('/formula-compositions', formulaCompositionRouter);
router.use('/formula-energies', formulaEnergyRouter);
router.use('/formula-nutritions', formulaNutritionRouter);
router.use('/formula-additionals', formulaAdditionalRouter);

export default router;

