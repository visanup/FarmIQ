// services/formula-service/src/routes/formula.route.ts
import { Router, Request, Response } from 'express';
import { FormulaService } from '../services/formula.service';

const router = Router();
const service = new FormulaService();

/**
 * @swagger
 * tags:
 *   - name: Formulas
 *     description: CRUD operations for formulas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Formula:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /formulas:
 *   get:
 *     summary: Retrieve all formulas
 *     tags: [Formulas]
 *     responses:
 *       200:
 *         description: A list of formulas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Formula'
 */
router.get('/', async (_req: Request, res: Response) => {
  const formulas = await service.findAll();
  res.json(formulas);
});

/**
 * @swagger
 * /formulas/{id}:
 *   get:
 *     summary: Get a formula by ID
 *     tags: [Formulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the formula
 *     responses:
 *       200:
 *         description: Formula found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Formula'
 *       404:
 *         description: Formula not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const formula = await service.findOneById(id);
  if (!formula) return res.status(404).json({ message: 'Formula not found' });
  res.json(formula);
});

/**
 * @swagger
 * /formulas:
 *   post:
 *     summary: Create a new formula
 *     tags: [Formulas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Formula'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Formula'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  const newFormula = await service.create(req.body);
  res.status(201).json(newFormula);
});

/**
 * @swagger
 * /formulas/{id}:
 *   put:
 *     summary: Update a formula by ID
 *     tags: [Formulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the formula to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Formula'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Formula'
 *       404:
 *         description: Formula not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await service.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Formula not found' });
  res.json(updated);
});

/**
 * @swagger
 * /formulas/{id}:
 *   delete:
 *     summary: Delete a formula by ID
 *     tags: [Formulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the formula to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Formula not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Formula not found' });
  res.status(204).send();
});

export default router;

