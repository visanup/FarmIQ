/**
 * Routes for House entity endpoints using Express and TypeORM.
 * Base path: /api/houses
 *
 * @swagger
 * components:
 *   schemas:
 *     House:
 *       type: object
 *       properties:
 *         house_id:
 *           type: integer
 *         customer_id:
 *           type: integer
 *         farm_id:
 *           type: integer
 *         name:
 *           type: string
 *         area:
 *           type: number
 *         capacity:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

import { Router, Request, Response, NextFunction } from 'express';
import { HouseService } from '../services/houses.service';

const router = Router();
const service = new HouseService();

/**
 * @swagger
 * tags:
 *   name: Houses
 *   description: House management endpoints
 */

/**
 * @swagger
 * /api/houses:
 *   get:
 *     summary: Fetch list of all houses
 *     tags: [Houses]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by customer ID
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by farm ID
 *     responses:
 *       200:
 *         description: A list of houses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/House'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, farmId } = req.query;
    const filters: { customerId?: number; farmId?: number } = {};
    if (customerId) filters.customerId = Number(customerId);
    if (farmId) filters.farmId = Number(farmId);
    const houses = await service.findAll(filters);
    res.json(houses);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/houses/{id}:
 *   get:
 *     summary: Fetch a house by ID
 *     tags: [Houses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the house
 *     responses:
 *       200:
 *         description: House object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       404:
 *         description: House not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const house = await service.findOne(id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/houses/{id}/customer/{customer_id}:
 *   get:
 *     summary: Fetch a house by ID and customer ID
 *     tags: [Houses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the house
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: House object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       404:
 *         description: House not found for this customer
 */
router.get('/:id/customer/:customer_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customerId = Number(req.params.customer_id);
    const house = await service.findOneByCustomer(id, customerId);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/houses:
 *   post:
 *     summary: Create a new house
 *     tags: [Houses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/House'
 *     responses:
 *       201:
 *         description: House created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newHouse = await service.create(data);
    res.status(201).json(newHouse);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/houses/{id}:
 *   put:
 *     summary: Update an existing house by ID
 *     tags: [Houses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the house to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/House'
 *     responses:
 *       200:
 *         description: House updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/House'
 *       404:
 *         description: House not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'House not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/houses/{id}:
 *   delete:
 *     summary: Delete a house by ID
 *     tags: [Houses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the house to delete
 *     responses:
 *       204:
 *         description: House deleted successfully
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
