// services/data-service/src/routes/geneticFactor.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { GeneticFactorService } from '../services/geneticFactor.service';

const router = Router();
const service = new GeneticFactorService();

/**
 * @swagger
 * tags:
 *   name: GeneticFactors
 *   description: Genetic factor management endpoints
 */

/**
 * @swagger
 * /api/genetic-factors:
 *   get:
 *     summary: Fetch list of all genetic factors
 *     tags: [GeneticFactors]
 *     responses:
 *       200:
 *         description: A list of genetic factors
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
 * /api/genetic-factors/{id}:
 *   get:
 *     summary: Fetch a genetic factor by ID
 *     tags: [GeneticFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the genetic factor
 *     responses:
 *       200:
 *         description: Genetic factor object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: GeneticFactor not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findOne(id);
    if (!item) return res.status(404).json({ message: 'GeneticFactor not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/genetic-factors/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a genetic factor by ID and customer ID
 *     tags: [GeneticFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the genetic factor
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Genetic factor object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: GeneticFactor not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const gf = await service.findOneByCustomer(id, customerId);
      if (!gf) {
        return res
          .status(404)
          .json({ message: 'GeneticFactor not found for this customer' });
      }
      res.json(gf);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/genetic-factors:
 *   post:
 *     summary: Create a new genetic factor
 *     tags: [GeneticFactors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Genetic factor created successfully
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
 * /api/genetic-factors/{id}:
 *   put:
 *     summary: Update an existing genetic factor by ID
 *     tags: [GeneticFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the genetic factor to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: GeneticFactor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: GeneticFactor not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'GeneticFactor not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/genetic-factors/{id}:
 *   delete:
 *     summary: Delete a genetic factor by ID
 *     tags: [GeneticFactors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the genetic factor to delete
 *     responses:
 *       204:
 *         description: GeneticFactor deleted successfully
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