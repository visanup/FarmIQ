// 1. TsEvent.route.ts
import { Router, Request, Response } from 'express';
import { TsEventService } from '../services/TsEvent.service';

const tsEventService = new TsEventService();
export const TsEventRouter = Router();

/**
 * @swagger
 * tags:
 *   name: TsEvent
 *   description: Unified time-series events
 */

/**
 * @swagger
 * /analytics/ts-events:
 *   get:
 *     summary: Get all TS events
 *     tags: [TsEvent]
 *     responses:
 *       200:
 *         description: List of TS events
 */
TsEventRouter.get('/', async (req: Request, res: Response) => {
  const data = await tsEventService.findAll();
  res.json(data);
});

/**
 * @swagger
 * /analytics/ts-events/{id}:
 *   get:
 *     summary: Get TS event by ID
 *     tags: [TsEvent]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Single TS event
 *       404:
 *         description: Not found
 */
TsEventRouter.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await tsEventService.findById(id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

/**
 * @swagger
 * /analytics/ts-events:
 *   post:
 *     summary: Create a TS event
 *     tags: [TsEvent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TsEvent'
 *     responses:
 *       201:
 *         description: Created
 */
TsEventRouter.post('/', async (req: Request, res: Response) => {
  const created = await tsEventService.create(req.body);
  res.status(201).json(created);
});

/**
 * @swagger
 * /analytics/ts-events/{id}:
 *   put:
 *     summary: Update a TS event
 *     tags: [TsEvent]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TsEvent'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
TsEventRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await tsEventService.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

/**
 * @swagger
 * /analytics/ts-events/{id}:
 *   delete:
 *     summary: Delete a TS event
 *     tags: [TsEvent]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: No content
 */
TsEventRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await tsEventService.delete(id);
  res.status(204).send();
});