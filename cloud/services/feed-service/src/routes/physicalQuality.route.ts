// feed-service/src/routes/physicalQuality.route.ts
import { Router, Request, Response } from 'express';
import { PhysicalQualityService } from '../services/physicalQuality.service';
import { PhysicalQuality } from '../models/physicalQuality.model';
import { AppDataSource } from '../utils/dataSource';

const repo = AppDataSource.getRepository(PhysicalQuality);
const service = new PhysicalQualityService(repo);
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PhysicalQuality
 *     description: Operations on physical quality metrics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PhysicalQuality:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         weight:
 *           type: number
 *           description: Weight of the sample
 *         volume:
 *           type: number
 *           description: Volume of the sample
 *         density:
 *           type: number
 *           description: Density calculated
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /physical-quality:
 *   post:
 *     summary: Create a new physical quality record
 *     tags: [PhysicalQuality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhysicalQuality'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhysicalQuality'
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
 * /physical-quality:
 *   get:
 *     summary: Retrieve all physical quality records
 *     tags: [PhysicalQuality]
 *     responses:
 *       200:
 *         description: A list of physical quality records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhysicalQuality'
 */
router.get('/', async (_req, res) => {
  const list = await service.findAll();
  res.json(list);
});

/**
 * @swagger
 * /physical-quality/{id}:
 *   get:
 *     summary: Get a physical quality record by ID
 *     tags: [PhysicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the physical quality record
 *     responses:
 *       200:
 *         description: Physical quality record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhysicalQuality'
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
 * /physical-quality/{id}:
 *   put:
 *     summary: Update a physical quality record by ID
 *     tags: [PhysicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhysicalQuality'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhysicalQuality'
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
 * /physical-quality/{id}:
 *   delete:
 *     summary: Delete a physical quality record by ID
 *     tags: [PhysicalQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the record to delete
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/:id', async (req, res) => {
  await service.delete(Number(req.params.id));
  res.status(204).send();
});

export default router;
