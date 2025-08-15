// services/data-service/src/routes/operationRecord.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { OperationRecordService } from '../services/operationRecord.service';

const orRouter = Router();
const orService = new OperationRecordService();

/**
 * @swagger
 * tags:
 *   name: OperationRecords
 *   description: Operation record management endpoints
 */

/**
 * @swagger
 * /api/operation-records:
 *   get:
 *     summary: Fetch list of all operational records
 *     tags: [OperationRecords]
 *     responses:
 *       200:
 *         description: A list of operational records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
orRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await orService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/operation-records/{id}:
 *   get:
 *     summary: Fetch an operational record by ID
 *     tags: [OperationRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the operational record
 *     responses:
 *       200:
 *         description: Operational record object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: OperationRecord not found
 */
orRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const item = await orService.findOne(id);
    if (!item) {
      return res.status(404).json({ message: 'OperationRecord not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/operation-records/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch an operational record by ID and customer ID
 *     tags: [OperationRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the operational record
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Operational record object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: OperationRecord not found for this customer
 */
orRouter.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      if (isNaN(id) || isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const record = await orService.findOneByCustomer(id, customerId);
      if (!record) {
        return res.status(404).json({ message: 'OperationRecord not found for this customer' });
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
});

/**
 * @swagger
 * /api/operation-records:
 *   post:
 *     summary: Create a new operational record
 *     tags: [OperationRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Operational record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
orRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await orService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/operation-records/{id}:
 *   put:
 *     summary: Update an existing operational record by ID
 *     tags: [OperationRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the operational record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Operational record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: OperationRecord not found
 */
orRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    const data = req.body;
    const updated = await orService.update(id, data);
    if (!updated) {
      return res.status(404).json({ message: 'OperationRecord not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/operation-records/{id}:
 *   delete:
 *     summary: Delete an operational record by ID
 *     tags: [OperationRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the operational record to delete
 *     responses:
 *       204:
 *         description: Operational record deleted successfully
 */
orRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    await orService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default orRouter;
