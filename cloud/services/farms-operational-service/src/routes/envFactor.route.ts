// services/data-service/src/routes/envFactor.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EnvFactorService } from '../services/envFactor.service';

const router = Router();
const service = new EnvFactorService();

/**
 * @swagger
 * tags:
 *   name: EnvFactors
 *   description: Environmental factor management endpoints
 */

/**
 * @swagger
 * /api/env-factors:
 *   get:
 *     summary: Fetch list of all environmental factors
 *     tags: [EnvFactors]
 *     responses:
 *       200:
 *         description: A list of environmental factors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await service.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/env-factors/{id}:
 *   get:
 *     summary: Fetch an environmental factor by ID
 *     tags: [EnvFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the environmental factor
 *     responses:
 *       200:
 *         description: Environmental factor object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Environmental factor not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findOne(id);
    if (!item) return res.status(404).json({ message: 'EnvironmentalFactor not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/env-factors/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch an environmental factor by ID and customer ID
 *     tags: [EnvFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the environmental factor
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Environmental factor object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Environmental factor not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const item = await service.findOneByCustomer(id, customerId);
      if (!item) {
        return res.status(404).json({ message: 'Not found for this customer' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/env-factors:
 *   post:
 *     summary: Create a new environmental factor
 *     tags: [EnvFactors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Environmental factor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await service.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/env-factors/{id}:
 *   put:
 *     summary: Update an existing environmental factor by ID
 *     tags: [EnvFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the environmental factor to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Environmental factor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Environmental factor not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'EnvironmentalFactor not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/env-factors/{id}:
 *   delete:
 *     summary: Delete an environmental factor by ID
 *     tags: [EnvFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the environmental factor to delete
 *     responses:
 *       204:
 *         description: Environmental factor deleted successfully
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;