// services/data-service/src/routes/feedProgram.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FeedProgramService } from '../services/feedProgram.service';

const router = Router();
const service = new FeedProgramService();

/**
 * @swagger
 * tags:
 *   name: FeedPrograms
 *   description: Feed program management endpoints
 */

/**
 * @swagger
 * /api/feed-programs:
 *   get:
 *     summary: Fetch list of all feed programs
 *     tags: [FeedPrograms]
 *     responses:
 *       200:
 *         description: A list of feed programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const programs = await service.findAll();
    res.json(programs);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-programs/{id}:
 *   get:
 *     summary: Fetch a feed program by ID
 *     tags: [FeedPrograms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed program
 *     responses:
 *       200:
 *         description: Feed program object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: FeedProgram not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const program = await service.findOne(id);
    if (!program) return res.status(404).json({ message: 'FeedProgram not found' });
    res.json(program);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-programs/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a feed program by ID and customer ID
 *     tags: [FeedPrograms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed program
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Feed program object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: FeedProgram not found for this customer
 */
router.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      const program = await service.findOneByCustomer(id, customerId);
      if (!program) {
        return res
          .status(404)
          .json({ message: 'FeedProgram not found for this customer' });
      }
      res.json(program);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/feed-programs:
 *   post:
 *     summary: Create a new feed program
 *     tags: [FeedPrograms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Feed program created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newProgram = await service.create(data);
    res.status(201).json(newProgram);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-programs/{id}:
 *   put:
 *     summary: Update an existing feed program by ID
 *     tags: [FeedPrograms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed program to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Feed program updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: FeedProgram not found
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) return res.status(404).json({ message: 'FeedProgram not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/feed-programs/{id}:
 *   delete:
 *     summary: Delete a feed program by ID
 *     tags: [FeedPrograms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the feed program to delete
 *     responses:
 *       204:
 *         description: Feed program deleted successfully
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