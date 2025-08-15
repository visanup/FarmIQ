// services/data-service/src/routes/deviceType.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceTypeService } from '../services/deviceType.service';

const router = Router();
const service = new DeviceTypeService();

/**
 * @swagger
 * tags:
 *   name: DeviceTypes
 *   description: Device type management endpoints
 */

/**
 * @swagger
 * /api/device-types:
 *   get:
 *     summary: Fetch list of all device types
 *     tags: [DeviceTypes]
 *     responses:
 *       200:
 *         description: A list of device types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await service.findAll();
    res.json(types);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-types/{id}:
 *   get:
 *     summary: Fetch a device type by ID
 *     tags: [DeviceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device type
 *     responses:
 *       200:
 *         description: Device type object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: DeviceType not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const type = await service.findOne(id);
    if (!type) return res.status(404).json({ message: 'DeviceType not found' });
    res.json(type);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-types/{type_id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch device type by type_id and customer_id
 *     tags: [DeviceTypes]
 *     parameters:
 *       - in: path
 *         name: type_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device type
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Device type object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: DeviceType not found for given IDs
 */
router.get('/:type_id/customer_id/:customer_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type_id = Number(req.params.type_id);
    const customer_id = Number(req.params.customer_id);
    if (isNaN(type_id) || isNaN(customer_id)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const result = await service.findByTypeIdAndCustomerId(type_id, customer_id);
    if (!result) return res.status(404).json({ message: 'DeviceType not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-types:
 *   post:
 *     summary: Create a new device type
 *     tags: [DeviceTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: DeviceType created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newType = await service.create(data);
    res.status(201).json(newType);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-types/{id}:
 *   put:
 *     summary: Update an existing device type by ID
 *     tags: [DeviceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: DeviceType updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: DeviceType not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ message: 'DeviceType not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/device-types/{id}:
 *   delete:
 *     summary: Delete a device type by ID
 *     tags: [DeviceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device type to delete
 *     responses:
 *       204:
 *         description: DeviceType deleted successfully
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
