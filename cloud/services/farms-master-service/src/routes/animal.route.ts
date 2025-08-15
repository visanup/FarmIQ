// services/data-service/src/routes/animal.route.ts

/**
 * Review of animal.route.ts with Swagger annotations
 * Ensuring schema references and consistent path grouping
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AnimalService } from '../services/animal.service';

const router = Router();
const service = new AnimalService();

/**
 * @swagger
 * tags:
 *   name: Animals
 *   description: Animal management endpoints
 *
 * components:
 *   schemas:
 *     Animal:
 *       type: object
 *       properties:
 *         animal_id:
 *           type: integer
 *         customer_id:
 *           type: integer
 *         farm_id:
 *           type: integer
 *         house_id:
 *           type: integer
 *         species:
 *           type: string
 *         breed:
 *           type: string
 *         birth_date:
 *           type: string
 *           format: date
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Fetch list of all animals
 *     tags: [Animals]
 *     responses:
 *       200:
 *         description: A list of animals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Animal'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animals = await service.findAll();
    res.json(animals);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Fetch an animal by ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the animal
 *     responses:
 *       200:
 *         description: Animal object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Animal not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const animal = await service.findOne(id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json(animal);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/animals/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch an animal by ID and customer ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the animal
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Animal object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Animal not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const animal = await service.findOneByCustomer(id, customerId);
      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }
      res.json(animal);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Create a new animal
 *     tags: [Animals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Animal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newAnimal = await service.create(data);
    res.status(201).json(newAnimal);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     summary: Update an existing animal by ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the animal to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Animal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Animal not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'Animal not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Delete an animal by ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the animal to delete
 *     responses:
 *       204:
 *         description: Animal deleted successfully
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