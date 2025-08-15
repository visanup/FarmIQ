// services/formula-service/src/routes/formulaAdditional.route.ts
import { Router, Request, Response } from 'express';
import { FormulaAdditionalService } from '../services/formulaAdditional.service';

const router = Router();
const service = new FormulaAdditionalService();

/**
 * @swagger
 * tags:
 *   - name: FormulaAdditional
 *     description: Manage additional formula data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FormulaAdditional:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         key:
 *           type: string
 *           description: Key of additional data
 *         value:
 *           type: string
 *           description: Value of additional data
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /formula-additional:
 *   get:
 *     summary: Retrieve all additional formula data
 *     tags: [FormulaAdditional]
 *     responses:
 *       200:
 *         description: A list of additional formula items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FormulaAdditional'
 */
router.get('/', async (_req: Request, res: Response) => {
  const items = await service.findAll();
  res.json(items);
});

/**
 * @swagger
 * /formula-additional/{id}:
 *   get:
 *     summary: Get additional data by ID
 *     tags: [FormulaAdditional]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the additional data
 *     responses:
 *       200:
 *         description: Additional data found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormulaAdditional'
 *       404:
 *         description: Data not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await service.findOneById(id);
  if (!item) return res.status(404).json({ message: 'Additional data not found' });
  res.json(item);
});

/**
 * @swagger
 * /formula-additional:
 *   post:
 *     summary: Create new additional formula data
 *     tags: [FormulaAdditional]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormulaAdditional'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormulaAdditional'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  const newItem = await service.create(req.body);
  res.status(201).json(newItem);
});

/**
 * @swagger
 * /formula-additional/{id}:
 *   put:
 *     summary: Update additional formula data by ID
 *     tags: [FormulaAdditional]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the data to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormulaAdditional'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormulaAdditional'
 *       404:
 *         description: Data not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await service.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Additional data not found' });
  res.json(updated);
});

/**
 * @swagger
 * /formula-additional/{id}:
 *   delete:
 *     summary: Delete additional formula data by ID
 *     tags: [FormulaAdditional]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the data to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Data not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Additional data not found' });
  res.status(204).send();
});

export default router;

