// feed-service/src/routes/feedBatchAssignments.route.ts
import { Router, Request, Response } from 'express';
import { FeedBatchAssignmentsService } from '../services/feedBatchAssignments.service';
import { FeedBatchAssignment } from '../models/feedBatchAssignments.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(FeedBatchAssignment);
const service = new FeedBatchAssignmentsService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: FeedBatchAssignments
 *     description: Feed batch assignment operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedBatchAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         batchId:
 *           type: integer
 *         assignmentDate:
 *           type: string
 *           format: date-time
 *         // TODO: add other model properties
 */

/**
 * @swagger
 * /feed-batch-assignments:
 *   post:
 *     summary: Create a new FeedBatchAssignment
 *     tags: [FeedBatchAssignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedBatchAssignment'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatchAssignment'
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
 * /feed-batch-assignments:
 *   get:
 *     summary: Retrieve all FeedBatchAssignments
 *     tags: [FeedBatchAssignments]
 *     responses:
 *       200:
 *         description: A list of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedBatchAssignment'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /feed-batch-assignments/{id}:
 *   get:
 *     summary: Get a FeedBatchAssignment by ID
 *     tags: [FeedBatchAssignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the assignment
 *     responses:
 *       200:
 *         description: Assignment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatchAssignment'
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res) => {
  const entity = await service.findById(Number(req.params.id));
  if (!entity) return res.status(404).json({ error: 'Not found' });
  res.json(entity);
});

/**
 * @swagger
 * /feed-batch-assignments/{id}:
 *   put:
 *     summary: Update a FeedBatchAssignment by ID
 *     tags: [FeedBatchAssignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the assignment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedBatchAssignment'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedBatchAssignment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await service.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/**
 * @swagger
 * /feed-batch-assignments/{id}:
 *   delete:
 *     summary: Delete a FeedBatchAssignment by ID
 *     tags: [FeedBatchAssignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the assignment to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
