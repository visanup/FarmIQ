// services/data-service/src/routes/deviceLog.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceLogService } from '../services/deviceLogs.service';

const router = Router();
const service = new DeviceLogService();

/**
 * @swagger
 * tags:
 *   name: DeviceLogs
 *   description: Device log management endpoints
 */

/**
 * @swagger
 * /api/device-logs:
 *   get:
 *     summary: Fetch list of all device logs
 *     tags: [DeviceLogs]
 *     parameters:
 *       - in: query
 *         name: device_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Optional device ID to filter logs by device
 *     responses:
 *       200:
 *         description: A list of device logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('GET all device-logs route, query:', req.query);
  try {
    const logs = await service.findAll();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-logs/{id}:
 *   get:
 *     summary: Fetch a device log by ID
 *     tags: [DeviceLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device log
 *     responses:
 *       200:
 *         description: Device log object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Device log not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  console.log('GET device-log by id route, id param:', req.params.id);
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    const log = await service.findOne(id);
    if (!log) return res.status(404).json({ message: 'DeviceLog not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-logs:
 *   post:
 *     summary: Create a new device log
 *     tags: [DeviceLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_id:
 *                 type: integer
 *               event_type:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - device_id
 *               - event_type
 *     responses:
 *       201:
 *         description: Device log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing required fields
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Basic validation example
    if (!data.device_id || !data.event_type) {
      return res.status(400).json({ error: 'Missing required fields: device_id, event_type' });
    }

    const newLog = await service.create(data);
    res.status(201).json(newLog);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-logs/{id}:
 *   put:
 *     summary: Update an existing device log by ID
 *     tags: [DeviceLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device log to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Device log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Device log not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ message: 'DeviceLog not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-logs/{id}:
 *   delete:
 *     summary: Delete a device log by ID
 *     tags: [DeviceLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device log to delete
 *     responses:
 *       204:
 *         description: Device log deleted successfully
 *       400:
 *         description: Invalid ID supplied
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log id parameter' });
    }

    await service.delete(id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-logs/{device_id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch device logs by device_id and customer_id
 *     tags: [DeviceLogs]
 *     parameters:
 *       - in: path
 *         name: device_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric device ID to filter logs
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric customer ID to filter logs
 *     responses:
 *       200:
 *         description: A list of device logs matching the given IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid parameters supplied
 */
router.get('/:device_id/customer_id/:customer_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const device_id = Number(req.params.device_id);
    const customer_id = Number(req.params.customer_id);
    if (isNaN(device_id) || isNaN(customer_id)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const logs = await service.findByDeviceAndCustomer(device_id, customer_id);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
