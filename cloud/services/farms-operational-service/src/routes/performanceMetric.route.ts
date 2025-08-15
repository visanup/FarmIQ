// services/data-service/src/routes/performanceMetric.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PerformanceMetricService } from '../services/performanceMetric.service';

const pmRouter = Router();
const pmService = new PerformanceMetricService();

/**
 * @swagger
 * tags:
 *   name: PerformanceMetrics
 *   description: Performance metric management endpoints
 */

/**
 * @swagger
 * /api/performance-metrics:
 *   get:
 *     summary: Fetch list of all performance metrics
 *     tags: [PerformanceMetrics]
 *     responses:
 *       200:
 *         description: A list of performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
pmRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await pmService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/performance-metrics/{id}/{date}:
 *   get:
 *     summary: Fetch a performance metric by ID and date
 *     tags: [PerformanceMetrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the metric
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the metric in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Performance metric object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: PerformanceMetric not found
 */
pmRouter.get('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date = req.params.date;
    if (isNaN(id) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const item = await pmService.findOne(id, date);
    if (!item) return res.status(404).json({ message: 'PerformanceMetric not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/performance-metrics/{id}/{date}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a performance metric by ID, date, and customer ID
 *     tags: [PerformanceMetrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the metric
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the metric in YYYY-MM-DD format
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Performance metric object matching criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: PerformanceMetric not found for this date/customer
 */
pmRouter.get(
  '/:id/:date/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const date = req.params.date;
      const customerId = Number(req.params.customer_id);
      if (
        isNaN(id) ||
        isNaN(customerId) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const item = await pmService.findOneByDateAndCustomer(id, date, customerId);
      if (!item) {
        return res.status(404).json({ message: 'PerformanceMetric not found for this date/customer' });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/performance-metrics:
 *   post:
 *     summary: Create a new performance metric
 *     tags: [PerformanceMetrics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Performance metric created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
pmRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await pmService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/performance-metrics/{id}/{date}:
 *   put:
 *     summary: Update a performance metric by ID and date
 *     tags: [PerformanceMetrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the metric to update
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the metric in YYYY-MM-DD format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Performance metric updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: PerformanceMetric not found
 */
pmRouter.put('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date    = req.params.date;
    if (isNaN(id) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const data = req.body;
    const updated = await pmService.update(id, date, data);
    if (!updated) {
      return res.status(404).json({ message: 'PerformanceMetric not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/performance-metrics/{id}/{date}:
 *   delete:
 *     summary: Delete a performance metric by ID and date
 *     tags: [PerformanceMetrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the metric to delete
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the metric in YYYY-MM-DD format
 *     responses:
 *       204:
 *         description: Performance metric deleted successfully
 */
pmRouter.delete('/:id/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const date = req.params.date;
    if (isNaN(id) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    await pmService.delete(id, date);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default pmRouter;