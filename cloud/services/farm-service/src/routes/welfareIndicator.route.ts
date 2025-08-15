// services/data-service/src/routes/welfareIndicator.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { WelfareIndicatorService } from '../services/welfareIndicator.service';

const wiRouter = Router();
const wiService = new WelfareIndicatorService();

/**
 * @swagger
 * tags:
 *   name: WelfareIndicators
 *   description: Welfare indicator management endpoints
 */

/**
 * @swagger
 * /api/welfare-indicators:
 *   get:
 *     summary: Fetch list of all welfare indicators
 *     tags: [WelfareIndicators]
 *     responses:
 *       200:
 *         description: A list of welfare indicators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
wiRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await wiService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/welfare-indicators/{id}:
 *   get:
 *     summary: Fetch a welfare indicator by ID
 *     tags: [WelfareIndicators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the welfare indicator
 *     responses:
 *       200:
 *         description: Welfare indicator object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: WelfareIndicator not found
 */
wiRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const item = await wiService.findOne(id);
    if (!item) {
      return res.status(404).json({ message: 'WelfareIndicator not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/welfare-indicators/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a welfare indicator by ID and customer ID
 *     tags: [WelfareIndicators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the welfare indicator
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Welfare indicator matching criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: WelfareIndicator not found for this customer
 */
wiRouter.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      if (isNaN(id) || isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const item = await wiService.findOneByCustomer(id, customerId);
      if (!item) {
        return res
          .status(404)
          .json({ message: 'WelfareIndicator not found for this customer' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/welfare-indicators:
 *   post:
 *     summary: Create a new welfare indicator
 *     tags: [WelfareIndicators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Welfare indicator created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
wiRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await wiService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/welfare-indicators/{id}:
 *   put:
 *     summary: Update a welfare indicator by ID
 *     tags: [WelfareIndicators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the welfare indicator to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Welfare indicator updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: WelfareIndicator not found
 */
wiRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const data = req.body;
    const updated = await wiService.update(id, data);
    if (!updated) {
      return res.status(404).json({ message: 'WelfareIndicator not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/welfare-indicators/{id}:
 *   delete:
 *     summary: Delete a welfare indicator by ID
 *     tags: [WelfareIndicators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the welfare indicator to delete
 *     responses:
 *       204:
 *         description: Welfare indicator deleted successfully
 */
wiRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    await wiService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default wiRouter;