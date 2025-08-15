// feed-service/src/routes/chemicalQuality.route.ts
import { Router, Request, Response } from 'express';
import { ChemicalQualityService } from '../services/chemicalQuality.service';
import { ChemicalQuality } from '../models/chemicalQuality.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(ChemicalQuality);
const service = new ChemicalQualityService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: ChemicalQuality
 *     description: Chemical Quality management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChemicalQuality:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         // TODO: define other properties matching your model
 */

/**
 * @swagger
 * /chemical-quality:
 *   post:
 *     summary: Create a new ChemicalQuality entry
 *     tags: [ChemicalQuality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChemicalQuality'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChemicalQuality'
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
 * /chemical-quality:
 *   get:
 *     summary: Get all ChemicalQuality entries
 *     tags: [ChemicalQuality]
 *     responses:
 *       200:
 *         description: List of ChemicalQuality entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChemicalQuality'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /chemical-quality/{id}:
 *   get:
 *     summary: Get ChemicalQuality by ID
 *     tags: [ChemicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the ChemicalQuality entry
 *     responses:
 *       200:
 *         description: ChemicalQuality found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChemicalQuality'
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
 * /chemical-quality/{id}:
 *   put:
 *     summary: Update ChemicalQuality by ID
 *     tags: [ChemicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the ChemicalQuality entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChemicalQuality'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChemicalQuality'
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
 * /chemical-quality/{id}:
 *   delete:
 *     summary: Delete ChemicalQuality by ID
 *     tags: [ChemicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the ChemicalQuality entry to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
