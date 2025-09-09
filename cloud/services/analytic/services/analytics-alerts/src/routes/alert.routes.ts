// src/routes/alert.routes.ts
import { Router } from 'express';
import { AlertService } from '../services/alert.service';
import { Alert } from '../models/alert.model';
// Auth middleware removed
import { validateRequest } from '../middlewares/validation';
import * as z from 'zod';

/**
 * Router for alert-related endpoints
 */
export const alertRouter = Router();

// Initialize alert service
const alertService = new AlertService();

// Define Zod schema for alert creation
const alertSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  tenant_id: z.string().min(1),
  factory_id: z.string().min(1),
  device_id: z.string().min(1),
  metric: z.string().min(1),
  value: z.number(),
  alert_time: z.string().datetime(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  alert_type: z.string().min(1)
});

/**
 * GET /api/alerts - Get all alerts with pagination
 */
alertRouter.get('/alerts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
    
    const result = await alertService.getAllAlerts(page, limit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/alerts/:id - Get alert by ID
 */
alertRouter.get('/alerts/:id', async (req, res) => {
  try {
    const alert = await alertService.getAlertById(Number(req.params.id));
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json(alert);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

/**
 * GET /api/alerts/tenant/:tenantId - Get alerts by tenant with pagination
 */
alertRouter.get('/alerts/tenant/:tenantId', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    
    const result = await alertService.getAlertsByTenant(req.params.tenantId, page, limit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/alerts/tenant/:tenantId/factory/:factoryId - Get alerts by tenant and factory with pagination
 */
alertRouter.get('/alerts/tenant/:tenantId/factory/:factoryId', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    
    const result = await alertService.getAlertsByTenantAndFactory(req.params.tenantId, req.params.factoryId, page, limit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/alerts/unresolved - Get unresolved alerts with pagination
 */
alertRouter.get('/alerts/unresolved', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    
    const result = await alertService.getUnresolvedAlerts(page, limit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch unresolved alerts' });
  }
});

/**
 * POST /api/alerts - Create a new alert
 */
alertRouter.post('/alerts', 
  // Auth middleware removed
  validateRequest(alertSchema),
  async (req, res) => {
    try {
      const alert = await alertService.createAlert(req.body);
      return res.status(201).json(alert);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create alert' });
    }
  }
);

/**
 * PUT /api/alerts/:id/resolve - Resolve an alert
 */
alertRouter.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const alert = await alertService.resolveAlert(Number(req.params.id));
    return res.json(alert);
  } catch (error) {
    if (error instanceof Error && error.message === 'Alert not found') {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export default alertRouter;