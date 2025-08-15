// services/data-service/src/routes/device.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/device.service';

const router = Router();
const service = new DeviceService();

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management endpoints
 */

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Fetch all devices
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: A list of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await service.findAll();
    res.json(devices);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Fetch a device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device to fetch
 *     responses:
 *       200:
 *         description: Device object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Device not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    const device = await service.findOne(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/devices/{device_id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a device by device_id and customer_id
 *     tags: [Devices]
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
 *         description: Device object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: Device not found for given IDs
 */
router.get('/:device_id/customer_id/:customer_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const device_id = Number(req.params.device_id);
    const customer_id = Number(req.params.customer_id);
    if (isNaN(device_id) || isNaN(customer_id)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const device = await service.findByDeviceIdAndCustomerId(device_id, customer_id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               customer_id:
 *                 type: integer
 *               type:
 *                 type: string
 *             required:
 *               - name
 *               - customer_id
 *               - type
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newDevice = await service.create(data);
    res.status(201).json(newDevice);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update an existing device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Device not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    const updated = await service.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete a device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device to delete
 *     responses:
 *       204:
 *         description: Device deleted successfully
 *       400:
 *         description: Invalid ID supplied
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID parameter' });
    }
    await service.delete(id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
