// services/data-service/src/routes/deviceStatusHistory.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceStatusHistoryService } from '../services/deviceStatusHistory.service';

const router = Router();
const service = new DeviceStatusHistoryService();

/**
 * @swagger
 * tags:
 *   name: DeviceStatusHistory
 *   description: Device status history management endpoints
 */

/**
 * @swagger
 * /api/device-status-history:
 *   get:
 *     summary: Fetch all status history entries
 *     tags: [DeviceStatusHistory]
 *     parameters:
 *       - in: query
 *         name: device_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by device ID
 *     responses:
 *       200:
 *         description: A list of status history entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceIdParam = req.query.device_id as string;
      const deviceId = deviceIdParam ? Number(deviceIdParam) : undefined;
      const list = deviceId
        ? await service.findAll({ device_id: deviceId })
        : await service.findAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-status-history/{id}:
 *   get:
 *     summary: Fetch a single status history record by ID
 *     tags: [DeviceStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the status history record
 *     responses:
 *       200:
 *         description: A single status history record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Status history not found
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const record = await service.findOne(id);
      if (!record) return res.status(404).json({ message: 'Status history not found' });
      res.json(record);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-status-history:
 *   post:
 *     summary: Create a new status history record
 *     tags: [DeviceStatusHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Status history record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const newRecord = await service.create(data);
      res.status(201).json(newRecord);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-status-history/{id}:
 *   put:
 *     summary: Update an existing status history record
 *     tags: [DeviceStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the status history record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Status history record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Status history not found
 */
router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await service.update(id, req.body);
      if (!updated) return res.status(404).json({ message: 'Status history not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-status-history/{id}:
 *   delete:
 *     summary: Delete a status history record
 *     tags: [DeviceStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the status history record to delete
 *     responses:
 *       204:
 *         description: Status history record deleted successfully
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-status-history/{device_id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch status history records by device and customer IDs
 *     tags: [DeviceStatusHistory]
 *     parameters:
 *       - in: path
 *         name: device_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric device ID
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric customer ID
 *     responses:
 *       200:
 *         description: List of matching status history records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid parameters supplied
 */
router.get(
  '/:device_id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device_id = Number(req.params.device_id);
      const customer_id = Number(req.params.customer_id);

      if (isNaN(device_id) || isNaN(customer_id)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const records = await service.findByDeviceAndCustomer(device_id, customer_id);
      res.json(records);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
