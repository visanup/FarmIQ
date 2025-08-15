// services/data-service/src/routes/waterQuality.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { WaterQualityService } from '../services/waterQuality.service';

const wqRouter = Router();
const wqService = new WaterQualityService();

/**
 * @swagger
 * tags:
 *   name: WaterQuality
 *   description: Water quality management endpoints
 */

/**
 * @swagger
 * /api/water-quality:
 *   get:
 *     summary: Fetch list of all water quality records
 *     tags: [WaterQuality]
 *     responses:
 *       200:
 *         description: A list of water quality records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
wqRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await wqService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/water-quality/{id}:
 *   get:
 *     summary: Fetch a water quality record by ID
 *     tags: [WaterQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the water quality record
 *     responses:
 *       200:
 *         description: Water quality record object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: WaterQuality not found
 */
wqRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const item = await wqService.findOne(id);
    if (!item) {
      return res.status(404).json({ message: 'WaterQuality not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/water-quality/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a water quality record by ID and customer ID
 *     tags: [WaterQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the water quality record
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Water quality record matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: WaterQuality not found for this customer
 */
wqRouter.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      if (isNaN(id) || isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const record = await wqService.findOneByCustomer(id, customerId);
      if (!record) {
        return res
          .status(404)
          .json({ message: 'WaterQuality not found for this customer' });
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
});

/**
 * @swagger
 * /api/water-quality:
 *   post:
 *     summary: Create a new water quality record
 *     tags: [WaterQuality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Water quality created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
wqRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await wqService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/water-quality/{id}:
 *   put:
 *     summary: Update a water quality record by ID
 *     tags: [WaterQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Water quality updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: WaterQuality not found
 */
wqRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const data = req.body;
    const updated = await wqService.update(id, data);
    if (!updated) {
      return res.status(404).json({ message: 'WaterQuality not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/water-quality/{id}:
 *   delete:
 *     summary: Delete a water quality record by ID
 *     tags: [WaterQuality]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the record to delete
 *     responses:
 *       204:
 *         description: WaterQuality deleted successfully
 */
wqRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    await wqService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default wqRouter;