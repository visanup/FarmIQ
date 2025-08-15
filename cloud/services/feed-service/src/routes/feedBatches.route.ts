// feed-service/src/routes/feedBatches.route.ts

import { Router, Request, Response } from 'express';
import { FeedBatchesService } from '../services/feedBatches.service';
import { FeedBatch } from '../models/feedBatch.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(FeedBatch);
const service = new FeedBatchesService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: FeedBatches
 *     description: Operations related to feed batches
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedBatch:
 *       type: object
 *       properties:
 *         productionDate:
 *           type: string
 *           format: date-time
 *         feedBatchId:
 *           type: integer
 *         farmId:
 *           type: integer
 *         formulaId:
 *           type: integer
 *         formulaNo:
 *           type: integer
 *         lineNo:
 *           type: string
 *         batchNo:
 *           type: string
 *         feedType:
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
 * /feed-batches:
 *   post:
 *     summary: Create a new feed batch
 *     tags: [FeedBatches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedBatch'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatch'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/**
 * @swagger
 * /feed-batches:
 *   get:
 *     summary: Retrieve all feed batches
 *     tags: [FeedBatches]
 *     responses:
 *       200:
 *         description: List of feed batches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedBatch'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /feed-batches/{productionDate}/{feedBatchId}:
 *   get:
 *     summary: Get a feed batch by production date and ID
 *     tags: [FeedBatches]
 *     parameters:
 *       - in: path
 *         name: productionDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Production date of the batch
 *       - in: path
 *         name: feedBatchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the feed batch
 *     responses:
 *       200:
 *         description: Feed batch found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatch'
 *       404:
 *         description: Not found
 */
router.get('/:productionDate/:feedBatchId', async (req, res) => {
  const { productionDate, feedBatchId } = req.params;
  const entity = await service.findById(new Date(productionDate), Number(feedBatchId));
  if (!entity) return res.status(404).json({ error: 'Not found' });
  res.json(entity);
});

/**
 * @swagger
 * /feed-batches/{productionDate}/{feedBatchId}:
 *   put:
 *     summary: Update a feed batch by production date and ID
 *     tags: [FeedBatches]
 *     parameters:
 *       - in: path
 *         name: productionDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Production date of the batch
 *       - in: path
 *         name: feedBatchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the feed batch to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedBatch'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatch'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
router.put('/:productionDate/:feedBatchId', async (req, res) => {
  const { productionDate, feedBatchId } = req.params;
  try {
    const updated = await service.update(new Date(productionDate), Number(feedBatchId), req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/**
 * @swagger
 * /feed-batches/{productionDate}/{feedBatchId}:
 *   delete:
 *     summary: Delete a feed batch by production date and ID
 *     tags: [FeedBatches]
 *     parameters:
 *       - in: path
 *         name: productionDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Production date of the batch
 *       - in: path
 *         name: feedBatchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the feed batch to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:productionDate/:feedBatchId', async (req, res) => {
  const { productionDate, feedBatchId } = req.params;
  await service.delete(new Date(productionDate), Number(feedBatchId));
  res.status(204).send();
});

export default router;
