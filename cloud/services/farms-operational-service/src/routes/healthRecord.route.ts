// services/data-service/src/routes/healthRecord.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { HealthRecordService } from '../services/healthRecord.service';

const hrRouter = Router();
const hrService = new HealthRecordService();

/**
 * @swagger
 * tags:
 *   name: HealthRecords
 *   description: Health record management endpoints
 */

/**
 * @swagger
 * /api/health-records:
 *   get:
 *     summary: Fetch list of all health records
 *     tags: [HealthRecords]
 *     responses:
 *       200:
 *         description: A list of health records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
hrRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await hrService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/health-records/{id}:
 *   get:
 *     summary: Fetch a health record by ID
 *     tags: [HealthRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the health record
 *     responses:
 *       200:
 *         description: Health record object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: HealthRecord not found
 */
hrRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await hrService.findOne(id);
    if (!item) return res.status(404).json({ message: 'HealthRecord not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/health-records/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a health record by ID and customer ID
 *     tags: [HealthRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the health record
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Health record object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: HealthRecord not found for this customer
 */
hrRouter.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const house = await hrService.findOneByCustomer(id, customerId);
      if (!house) {
        return res.status(404).json({ message: 'HealthRecord not found for this customer' });
      }
      res.json(house);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/health-records:
 *   post:
 *     summary: Create a new health record
 *     tags: [HealthRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Health record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
hrRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await hrService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/health-records/{id}:
 *   put:
 *     summary: Update an existing health record by ID
 *     tags: [HealthRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the health record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Health record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: HealthRecord not found
 */
hrRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await hrService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'HealthRecord not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/health-records/{id}:
 *   delete:
 *     summary: Delete a health record by ID
 *     tags: [HealthRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the health record to delete
 *     responses:
 *       204:
 *         description: Health record deleted successfully
 */
hrRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await hrService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default hrRouter;
