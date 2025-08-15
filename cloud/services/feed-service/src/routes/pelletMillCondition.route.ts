// pelletMillCondition.route.ts

import { Router, Request, Response } from 'express';
import { PelletMillConditionService } from '../services/pelletMillCondition.service';
import { PelletMillCondition } from '../models/pelletMillCondition.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(PelletMillCondition);
const service = new PelletMillConditionService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PelletMillCondition
 *     description: Operations on pellet mill conditions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PelletMillCondition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         temperature:
 *           type: number
 *           description: Temperature of pellet mill
 *         pressure:
 *           type: number
 *           description: Pressure in pellet mill
 *         moisture:
 *           type: number
 *           description: Moisture level of pellet output
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /pellet-mill-condition:
 *   post:
 *     summary: Create a new pellet mill condition
 *     tags: [PelletMillCondition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PelletMillCondition'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PelletMillCondition'
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
 * /pellet-mill-condition:
 *   get:
 *     summary: Retrieve all pellet mill conditions
 *     tags: [PelletMillCondition]
 *     responses:
 *       200:
 *         description: A list of pellet mill conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PelletMillCondition'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /pellet-mill-condition/{id}:
 *   get:
 *     summary: Get a pellet mill condition by ID
 *     tags: [PelletMillCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the pellet mill condition
 *     responses:
 *       200:
 *         description: Pellet mill condition found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PelletMillCondition'
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
 * /pellet-mill-condition/{id}:
 *   put:
 *     summary: Update a pellet mill condition by ID
 *     tags: [PelletMillCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the condition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PelletMillCondition'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PelletMillCondition'
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
 * /pellet-mill-condition/{id}:
 *   delete:
 *     summary: Delete a pellet mill condition by ID
 *     tags: [PelletMillCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the condition to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
