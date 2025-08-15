// services/formula-service/src/routes/formulaNutrition.route.ts
import { Router, Request, Response } from 'express';
import { FormulaNutritionService } from '../services/formulaNutrition.service';

const router = Router();
const service = new FormulaNutritionService();

/**
 * @swagger
 * tags:
 *   - name: FormulaNutrition
 *     description: Manage formula nutrition data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NutritionData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         formulaId:
 *           type: integer
 *         nutrient:
 *           type: string
 *         value:
 *           type: number
 *         unit:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /formula-nutrition:
 *   get:
 *     summary: Retrieve all nutrition data records
 *     tags: [FormulaNutrition]
 *     responses:
 *       200:
 *         description: A list of nutrition data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NutritionData'
 */
router.get('/', async (_req: Request, res: Response) => {
  const items = await service.findAll();
  res.json(items);
});

/**
 * @swagger
 * /formula-nutrition/{id}:
 *   get:
 *     summary: Get nutrition data by ID
 *     tags: [FormulaNutrition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the nutrition data
 *     responses:
 *       200:
 *         description: Nutrition data found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NutritionData'
 *       404:
 *         description: Nutrition data not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await service.findOneById(id);
  if (!item) return res.status(404).json({ message: 'Nutrition data not found' });
  res.json(item);
});

/**
 * @swagger
 * /formula-nutrition:
 *   post:
 *     summary: Create new nutrition data record
 *     tags: [FormulaNutrition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NutritionData'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NutritionData'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  const newItem = await service.create(req.body);
  res.status(201).json(newItem);
});

/**
 * @swagger
 * /formula-nutrition/{id}:
 *   put:
 *     summary: Update nutrition data by ID
 *     tags: [FormulaNutrition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the nutrition data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NutritionData'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NutritionData'
 *       404:
 *         description: Nutrition data not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await service.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Nutrition data not found' });
  res.json(updated);
});

/**
 * @swagger
 * /formula-nutrition/{id}:
 *   delete:
 *     summary: Delete nutrition data by ID
 *     tags: [FormulaNutrition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the nutrition data to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Nutrition data not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Nutrition data not found' });
  res.status(204).send();
});

export default router;

