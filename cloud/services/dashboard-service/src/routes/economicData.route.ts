// services/economic-service/src/routes/economicData.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import EconomicDataService from '../services/economicData.service';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: EconomicData
 *   description: Economic data management endpoints
 */

/**
 * @swagger
 * /api/economic-data:
 *   get:
 *     summary: Fetch list of all economic data entries
 *     tags: [EconomicData]
 *     responses:
 *       200:
 *         description: A list of economic data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await EconomicDataService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/economic-data/{id}:
 *   get:
 *     summary: Fetch economic data entry by ID
 *     tags: [EconomicData]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the economic data entry
 *     responses:
 *       200:
 *         description: Economic data object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Economic data not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await EconomicDataService.findById(+req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/economic-data:
 *   post:
 *     summary: Create a new economic data entry
 *     tags: [EconomicData]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Economic data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await EconomicDataService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/economic-data/{id}:
 *   put:
 *     summary: Update an existing economic data entry
 *     tags: [EconomicData]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the economic data entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Economic data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Economic data not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await EconomicDataService.update(+req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/economic-data/{id}:
 *   delete:
 *     summary: Delete an economic data entry by ID
 *     tags: [EconomicData]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the economic data entry to delete
 *     responses:
 *       204:
 *         description: Economic data deleted successfully
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await EconomicDataService.delete(+req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/economic-data/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch economic data by ID and customer ID
 *     tags: [EconomicData]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the economic data entry
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Economic data object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Economic data not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const customerId = Number(req.params.customer_id);
    try {
      const data = await EconomicDataService.findByIdAndCustomer(id, customerId);
      if (!data) {
        return res.status(404).json({ message: 'Not found for this customer' });
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;