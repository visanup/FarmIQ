// services/data-service/src/routes/feedIntake.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FeedIntakeService } from '../services/feedIntake.service';

const router = Router();
const service = new FeedIntakeService();

/**
 * @swagger
 * tags:
 *   name: FeedIntake
 *   description: Feed intake management endpoints
 */

/**
 * @swagger
 * /api/feed-intake:
 *   get:
 *     summary: Fetch list of all feed intake records
 *     tags: [FeedIntake]
 *     responses:
 *       200:
 *         description: A list of feed intake records
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
 * /api/feed-intake/{id}:
 *   get:
 *     summary: Fetch a feed intake record by ID
 *     tags: [FeedIntake]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed intake record
 *     responses:
 *       200:
 *         description: Feed intake record object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Feed intake not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await service.findOne(id);
    if (!item) return res.status(404).json({ message: 'FeedIntake not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-intake/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a feed intake record by ID and customer ID
 *     tags: [FeedIntake]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed intake record
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Feed intake record object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Feed intake not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const record = await service.findOneByCustomer(id, customerId);
      if (!record) {
        return res
          .status(404)
          .json({ message: 'FeedIntake not found for this customer' });
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/feed-intake:
 *   post:
 *     summary: Create a new feed intake record
 *     tags: [FeedIntake]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Feed intake record created successfully
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
 * /api/feed-intake/{id}:
 *   put:
 *     summary: Update an existing feed intake record by ID
 *     tags: [FeedIntake]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed intake record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Feed intake record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Feed intake not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'FeedIntake not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-intake/{id}:
 *   delete:
 *     summary: Delete a feed intake record by ID
 *     tags: [FeedIntake]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed intake record to delete
 *     responses:
 *       204:
 *         description: Feed intake record deleted successfully
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
