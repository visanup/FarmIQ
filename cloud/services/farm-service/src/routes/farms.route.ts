// services/data-service/src/routes/farm.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FarmService } from '../services/farms.service';

const router = Router();
const service = new FarmService();

/**
 * @swagger
 * tags:
 *   name: Farms
 *   description: Farm management endpoints
 */

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Fetch list of all farms
 *     tags: [Farms]
 *     responses:
 *       200:
 *         description: A list of farms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farms = await service.findAll();
    res.json(farms);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     summary: Fetch a farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the farm
 *     responses:
 *       200:
 *         description: Farm object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Farm not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const farm = await service.findOne(id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/farms/customer/{customer_id}:
 *   get:
 *     summary: Fetch all farms for a specific customer
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: List of farms for the customer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/customer/:customer_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer_id = Number(req.params.customer_id);
    const farms = await service.findByCustomerId(customer_id);
    res.json(farms);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Create a new farm
 *     tags: [Farms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Farm created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newFarm = await service.create(data);
    res.status(201).json(newFarm);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     summary: Update an existing farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the farm to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Farm updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Farm not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Farm not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Delete a farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the farm to delete
 *     responses:
 *       204:
 *         description: Farm deleted successfully
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
