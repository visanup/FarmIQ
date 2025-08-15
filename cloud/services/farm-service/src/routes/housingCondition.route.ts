// services/data-service/src/routes/housingCondition.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { HousingConditionService } from '../services/housingCondition.service';

const hcRouter = Router();
const hcService = new HousingConditionService();

/**
 * @swagger
 * tags:
 *   name: HousingConditions
 *   description: Housing condition management endpoints
 */

/**
 * @swagger
 * /api/housing-conditions:
 *   get:
 *     summary: Fetch list of all housing conditions
 *     tags: [HousingConditions]
 *     responses:
 *       200:
 *         description: A list of housing conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
hcRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await hcService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/housing-conditions/{id}:
 *   get:
 *     summary: Fetch a housing condition by ID
 *     tags: [HousingConditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the housing condition
 *     responses:
 *       200:
 *         description: Housing condition object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: HousingCondition not found
 */
hcRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await hcService.findOne(id);
    if (!item) return res.status(404).json({ message: 'HousingCondition not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/housing-conditions/{id}/customer_id/{customer_id}:
 *   get:
 *     summary: Fetch a housing condition by ID and customer ID
 *     tags: [HousingConditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the housing condition
 *       - in: path
 *         name: customer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the customer
 *     responses:
 *       200:
 *         description: Housing condition object matching both IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid parameters supplied
 *       404:
 *         description: HousingCondition not found for this customer
 */
hcRouter.get(
  '/:id/customer_id/:customer_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const customerId = Number(req.params.customer_id);
      if (isNaN(id) || isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      const hc = await hcService.findOneByCustomer(id, customerId);
      if (!hc) {
        return res
          .status(404)
          .json({ message: 'HousingCondition not found for this customer' });
      }
      res.json(hc);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/housing-conditions:
 *   post:
 *     summary: Create a new housing condition record
 *     tags: [HousingConditions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Housing condition created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
hcRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await hcService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/housing-conditions/{id}:
 *   put:
 *     summary: Update an existing housing condition by ID
 *     tags: [HousingConditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the housing condition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Housing condition updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: HousingCondition not found
 */
hcRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await hcService.update(id, data);
    if (!updated) return res.status(404).json({ message: 'HousingCondition not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/housing-conditions/{id}:
 *   delete:
 *     summary: Delete a housing condition by ID
 *     tags: [HousingConditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the housing condition to delete
 *     responses:
 *       204:
 *         description: Housing condition deleted successfully
 */
hcRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await hcService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default hcRouter;
