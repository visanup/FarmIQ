// services/formula-service/src/routes/formulaComposition.route.ts
import { Router, Request, Response } from 'express';
import { FormulaCompositionService } from '../services/formulaComposition.service';

const router = Router();
const service = new FormulaCompositionService();

/**
 * @swagger
 * tags:
 *   - name: FormulaComposition
 *     description: Manage formula composition relationships
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Composition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         formulaId:
 *           type: integer
 *         ingredientId:
 *           type: integer
 *         quantity:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /formula-compositions:
 *   get:
 *     summary: Retrieve all formula compositions
 *     tags: [FormulaComposition]
 *     responses:
 *       200:
 *         description: A list of compositions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Composition'
 */
router.get('/', async (_req: Request, res: Response) => {
  const items = await service.findAll();
  res.json(items);
});

/**
 * @swagger
 * /formula-compositions/{id}:
 *   get:
 *     summary: Get a composition by ID
 *     tags: [FormulaComposition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the composition
 *     responses:
 *       200:
 *         description: Composition found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Composition'
 *       404:
 *         description: Composition not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await service.findOneById(id);
  if (!item) return res.status(404).json({ message: 'Composition not found' });
  res.json(item);
});

/**
 * @swagger
 * /formula-compositions:
 *   post:
 *     summary: Create a new composition
 *     tags: [FormulaComposition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Composition'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Composition'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  const newItem = await service.create(req.body);
  res.status(201).json(newItem);
});

/**
 * @swagger
 * /formula-compositions/{id}:
 *   put:
 *     summary: Update a composition by ID
 *     tags: [FormulaComposition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the composition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Composition'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Composition'
 *       404:
 *         description: Composition not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await service.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Composition not found' });
  res.json(updated);
});

/**
 * @swagger
 * /formula-compositions/{id}:
 *   delete:
 *     summary: Delete a composition by ID
 *     tags: [FormulaComposition]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the composition to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Composition not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Composition not found' });
  res.status(204).send();
});

export default router;

