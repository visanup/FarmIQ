// services/external-factor-service/src/routes/externalFactors.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import ExternalFactorsService from '../services/externalFactors.service';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ExternalFactors
 *   description: External factors management endpoints
 */

/**
 * @swagger
 * /api/external-factors:
 *   get:
 *     summary: Fetch list of all external factors
 *     tags: [ExternalFactors]
 *     responses:
 *       200:
 *         description: A list of external factors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await ExternalFactorsService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/external-factors/{id}:
 *   get:
 *     summary: Fetch external factor by ID
 *     tags: [ExternalFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the external factor
 *     responses:
 *       200:
 *         description: External factor object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: External factor not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await ExternalFactorsService.findById(+req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/external-factors/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch external factor by ID and customer ID
 *     tags: [ExternalFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the external factor
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: External factor object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: External factor not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const customerId = Number(req.params.customer_id);
    try {
      const item = await ExternalFactorsService.findByIdAndCustomer(id, customerId);
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
 * /api/external-factors:
 *   post:
 *     summary: Create a new external factor
 *     tags: [ExternalFactors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: External factor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await ExternalFactorsService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/external-factors/{id}:
 *   put:
 *     summary: Update an existing external factor by ID
 *     tags: [ExternalFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the external factor to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: External factor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: External factor not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await ExternalFactorsService.update(+req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/external-factors/{id}:
 *   delete:
 *     summary: Delete an external factor by ID
 *     tags: [ExternalFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the external factor to delete
 *     responses:
 *       204:
 *         description: External factor deleted successfully
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ExternalFactorsService.delete(+req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
