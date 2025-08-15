// services/analytics/src/routes/FeatureStore.route.ts
import { Router, Request, Response } from 'express';
import { FeatureStoreService } from '../services/FeatureStore.service';

const featureService = new FeatureStoreService();
export const FeatureStoreRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FeatureStore:
 *       type: object
 *       properties:
 *         featureId:
 *           type: integer
 *           description: Auto-generated feature ID
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
 *         featureName:
 *           type: string
 *         featureValue:
 *           type: number
 *         featureDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * tags:
 *   - name: FeatureStore
 *     description: Engineered features per entity
 */

/**
 * @swagger
 * /analytics/features:
 *   get:
 *     summary: Retrieve all engineered features
 *     tags: [FeatureStore]
 *     responses:
 *       200:
 *         description: List of features
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeatureStore'
 */
FeatureStoreRouter.get('/', async (_req: Request, res: Response) => {
  const data = await featureService.findAll();
  res.json(data);
});

/**
 * @swagger
 * /analytics/features/{id}:
 *   get:
 *     summary: Retrieve a feature by ID
 *     tags: [FeatureStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feature to retrieve
 *     responses:
 *       200:
 *         description: Feature found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureStore'
 *       404:
 *         description: Feature not found
 */
FeatureStoreRouter.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await featureService.findById(id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

/**
 * @swagger
 * /analytics/features:
 *   post:
 *     summary: Create a new feature
 *     tags: [FeatureStore]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeatureStore'
 *     responses:
 *       201:
 *         description: Feature created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureStore'
 */
FeatureStoreRouter.post('/', async (req: Request, res: Response) => {
  const created = await featureService.create(req.body);
  res.status(201).json(created);
});

/**
 * @swagger
 * /analytics/features/{id}:
 *   put:
 *     summary: Update an existing feature
 *     tags: [FeatureStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feature to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeatureStore'
 *     responses:
 *       200:
 *         description: Feature updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureStore'
 *       404:
 *         description: Feature not found
 */
FeatureStoreRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await featureService.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

/**
 * @swagger
 * /analytics/features/{id}:
 *   delete:
 *     summary: Delete a feature by ID
 *     tags: [FeatureStore]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feature to delete
 *     responses:
 *       204:
 *         description: Feature deleted
 */
FeatureStoreRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await featureService.delete(id);
  res.status(204).send();
});
