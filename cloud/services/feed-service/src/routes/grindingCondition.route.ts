// feed-service/src/routes/grindingCondition.route.ts
import { Router, Request, Response } from 'express';
import { GrindingConditionService } from '../services/grindingCondition.service';
import { GrindingCondition } from '../models/grindingCondition.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(GrindingCondition);
const service = new GrindingConditionService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: GrindingCondition
 *     description: Operations on grinding conditions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GrindingCondition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         // TODO: add other properties of GrindingCondition model
 */

/**
 * @swagger
 * /grinding-condition:
 *   post:
 *     summary: Create a new grinding condition
 *     tags: [GrindingCondition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrindingCondition'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrindingCondition'
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
 * /grinding-condition:
 *   get:
 *     summary: Get all grinding conditions
 *     tags: [GrindingCondition]
 *     responses:
 *       200:
 *         description: List of grinding conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GrindingCondition'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /grinding-condition/{id}:
 *   get:
 *     summary: Get a grinding condition by ID
 *     tags: [GrindingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the grinding condition
 *     responses:
 *       200:
 *         description: Grinding condition found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrindingCondition'
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
 * /grinding-condition/{id}:
 *   put:
 *     summary: Update a grinding condition by ID
 *     tags: [GrindingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the grinding condition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrindingCondition'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrindingCondition'
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
 * /grinding-condition/{id}:
 *   delete:
 *     summary: Delete a grinding condition by ID
 *     tags: [GrindingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the grinding condition to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
