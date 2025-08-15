// services/analytics/src/routes/ModelResult.route.ts
import { Router, Request, Response } from 'express';
import { ModelResultService } from '../../services/analytics/ModelResult.service';

const resultService = new ModelResultService();
export const ModelResultRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ModelResult:
 *       type: object
 *       properties:
 *         resultId:
 *           type: integer
 *           description: Auto-generated result ID
 *         customerId:
 *           type: integer
 *         farmId:
 *           type: integer
 *         animalId:
 *           type: integer
 *         batchId:
 *           type: string
 *           nullable: true
 *         feedAssignmentId:
 *           type: integer
 *           nullable: true
 *         modelName:
 *           type: string
 *         prediction:
 *           type: object
 *           description: Prediction payload as JSON
 *         anomalyScore:
 *           type: number
 *           nullable: true
 *         resultDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: ModelResult
 *     description: Predictions and scores
 */

/**
 * @swagger
 * /analytics/results:
 *   get:
 *     summary: Retrieve all model results
 *     tags: [ModelResult]
 *     responses:
 *       200:
 *         description: List of model results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModelResult'
 */
ModelResultRouter.get('/', async (_req: Request, res: Response) => {
  const data = await resultService.findAll();
  res.json(data);
});

/**
 * @swagger
 * /analytics/results/{id}:
 *   get:
 *     summary: Retrieve a model result by ID
 *     tags: [ModelResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the result to retrieve
 *     responses:
 *       200:
 *         description: Model result found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelResult'
 *       404:
 *         description: Model result not found
 */
ModelResultRouter.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await resultService.findById(id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

/**
 * @swagger
 * /analytics/results:
 *   post:
 *     summary: Create a new model result
 *     tags: [ModelResult]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModelResult'
 *     responses:
 *       201:
 *         description: Model result created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelResult'
 */
ModelResultRouter.post('/', async (req: Request, res: Response) => {
  const created = await resultService.create(req.body);
  res.status(201).json(created);
});

/**
 * @swagger
 * /analytics/results/{id}:
 *   put:
 *     summary: Update an existing model result
 *     tags: [ModelResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the result to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModelResult'
 *     responses:
 *       200:
 *         description: Model result updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelResult'
 *       404:
 *         description: Model result not found
 */
ModelResultRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await resultService.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

/**
 * @swagger
 * /analytics/results/{id}:
 *   delete:
 *     summary: Delete a model result by ID
 *     tags: [ModelResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the result to delete
 *     responses:
 *       204:
 *         description: Model result deleted
 */
ModelResultRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await resultService.delete(id);
  res.status(204).send();
});
