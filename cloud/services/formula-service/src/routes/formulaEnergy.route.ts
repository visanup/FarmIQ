// services/formula-service/src/routes/formulaEnergy.route.ts
import { Router, Request, Response } from 'express';
import { FormulaEnergyService } from '../services/formulaEnergy.service';

const router = Router();
const service = new FormulaEnergyService();

/**
 * @swagger
 * tags:
 *   - name: FormulaEnergy
 *     description: Manage formula energy data
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EnergyData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         formulaId:
 *           type: integer
 *         energyValue:
 *           type: number
 *         unit:
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
 * /formula-energy:
 *   get:
 *     summary: Retrieve all formula energy records
 *     tags: [FormulaEnergy]
 *     responses:
 *       200:
 *         description: A list of energy records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EnergyData'
 */
router.get('/', async (_req: Request, res: Response) => {
  const items = await service.findAll();
  res.json(items);
});

/**
 * @swagger
 * /formula-energy/{id}:
 *   get:
 *     summary: Get energy data by ID
 *     tags: [FormulaEnergy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the energy data
 *     responses:
 *       200:
 *         description: Energy data found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergyData'
 *       404:
 *         description: Energy data not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await service.findOneById(id);
  if (!item) return res.status(404).json({ message: 'Energy data not found' });
  res.json(item);
});

/**
 * @swagger
 * /formula-energy:
 *   post:
 *     summary: Create new energy data record
 *     tags: [FormulaEnergy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnergyData'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergyData'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req: Request, res: Response) => {
  const newItem = await service.create(req.body);
  res.status(201).json(newItem);
});

/**
 * @swagger
 * /formula-energy/{id}:
 *   put:
 *     summary: Update energy data by ID
 *     tags: [FormulaEnergy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the energy data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnergyData'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergyData'
 *       404:
 *         description: Energy data not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await service.update(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Energy data not found' });
  res.json(updated);
});

/**
 * @swagger
 * /formula-energy/{id}:
 *   delete:
 *     summary: Delete energy data by ID
 *     tags: [FormulaEnergy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the energy data
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Energy data not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Energy data not found' });
  res.status(204).send();
});

export default router;
