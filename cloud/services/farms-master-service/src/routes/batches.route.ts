// services\farms-master-service\src\routes\batches.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { BatchService } from '../services/batches.service';

const router = Router();
const service = new BatchService();

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: Batch management endpoints
 */

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Fetch list of all batches
 *     tags: [Batches]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by customer ID
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by farm ID
 *     responses:
 *       200:
 *         description: A list of batches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Batch'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, farmId } = req.query;
    const filters: { customerId?: number; farmId?: number } = {};
    if (customerId) filters.customerId = Number(customerId);
    if (farmId) filters.farmId = Number(farmId);
    const batches = await service.findAll(filters);
    res.json(batches);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/batches/{batchId}:
 *   get:
 *     summary: Fetch a batch by batch ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the batch
 *     responses:
 *       200:
 *         description: Batch object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Batch not found
 */
router.get('/:batchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchId } = req.params;
    const batch = await service.findOne(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Batch'
 *     responses:
 *       201:
 *         description: Batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newBatch = await service.create(data);
    res.status(201).json(newBatch);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/batches/{batchId}:
 *   put:
 *     summary: Update an existing batch by batch ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the batch to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Batch'
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Batch not found
 */
router.put('/:batchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchId } = req.params;
    const data = req.body;
    const updated = await service.update(batchId, data);
    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/batches/{batchId}:
 *   delete:
 *     summary: Delete a batch by batch ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the batch to delete
 *     responses:
 *       204:
 *         description: Batch deleted successfully
 */
router.delete('/:batchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchId } = req.params;
    await service.remove(batchId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;