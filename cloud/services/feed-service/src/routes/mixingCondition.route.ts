// feed-service/src/routes/mixingCondition.route.ts
import { Router, Request, Response } from 'express';
import { MixingConditionService } from '../services/mixingCondition.service';
import { MixingCondition } from '../models/mixingCondition.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(MixingCondition);
const service = new MixingConditionService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: MixingCondition
 *     description: Operations on mixing conditions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MixingCondition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         // TODO: add other properties of MixingCondition model (e.g., speed, duration)
 */

/**
 * @swagger
 * /mixing-condition:
 *   post:
 *     summary: Create a new mixing condition
 *     tags: [MixingCondition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MixingCondition'
 *     responses:
 *       201:
 *         description: Mixing condition created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MixingCondition'
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
 * /mixing-condition:
 *   get:
 *     summary: Retrieve all mixing conditions
 *     tags: [MixingCondition]
 *     responses:
 *       200:
 *         description: List of mixing conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MixingCondition'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /mixing-condition/{id}:
 *   get:
 *     summary: Get a mixing condition by ID
 *     tags: [MixingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the mixing condition
 *     responses:
 *       200:
 *         description: Mixing condition found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MixingCondition'
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
 * /mixing-condition/{id}:
 *   put:
 *     summary: Update a mixing condition by ID
 *     tags: [MixingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the mixing condition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MixingCondition'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MixingCondition'
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
 * /mixing-condition/{id}:
 *   delete:
 *     summary: Delete a mixing condition by ID
 *     tags: [MixingCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the mixing condition to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
