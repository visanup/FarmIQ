// src/routes/customer.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

const router = Router();
const service = new CustomerService();

/**
 * GET /api/customers
 * Fetch list of all customers
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await service.findAll();
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/customers/:id
 * Fetch a single customer by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customer = await service.findOne(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newCustomer = await service.create(data);
    res.status(201).json(newCustomer);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/customers/:id
 * Update an existing customer
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await service.update(id, data);
    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer by ID
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
