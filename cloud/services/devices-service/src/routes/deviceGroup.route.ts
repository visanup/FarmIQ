// services/data-service/src/routes/deviceGroup.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DeviceGroupService } from '../services/deviceGroup.service';

const router = Router();
const service = new DeviceGroupService();

/**
 * @swagger
 * tags:
 *   name: DeviceGroups
 *   description: Device group management endpoints
 */

/**
 * @swagger
 * /api/device-groups:
 *   get:
 *     summary: Fetch list of all device groups
 *     tags: [DeviceGroups]
 *     responses:
 *       200:
 *         description: A list of device groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await service.findAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-groups/{id}:
 *   get:
 *     summary: Fetch a device group by ID
 *     tags: [DeviceGroups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device group
 *     responses:
 *       200:
 *         description: Device group object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Device group not found
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const group = await service.findOne(id);
      if (!group) return res.status(404).json({ message: 'DeviceGroup not found' });
      res.json(group);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-groups/{group_id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a device group by group_id and customer_id
 *     tags: [DeviceGroups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the group
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Device group matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Device group not found
 */
router.get(
  '/:group_id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group_id = Number(req.params.group_id);
      const customer_id = Number(req.params.customer_id);

      const group = await service.findByGroupIdAndCustomer(group_id, customer_id);
      if (!group) return res.status(404).json({ message: 'DeviceGroup not found' });

      res.json(group);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-groups:
 *   post:
 *     summary: Create a new device group
 *     tags: [DeviceGroups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Device group created successfully
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
      const newGroup = await service.create(data);
      res.status(201).json(newGroup);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-groups/{id}:
 *   put:
 *     summary: Update an existing device group by ID
 *     tags: [DeviceGroups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device group to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Device group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Device group not found
 */
router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await service.update(id, req.body);
      if (!updated) return res.status(404).json({ message: 'DeviceGroup not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/device-groups/{id}:
 *   delete:
 *     summary: Delete a device group by ID
 *     tags: [DeviceGroups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the device group to delete
 *     responses:
 *       204:
 *         description: Device group deleted successfully
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
