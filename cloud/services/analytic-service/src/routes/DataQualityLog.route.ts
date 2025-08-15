// services/analytics/src/routes/DataQualityLog.route.ts
import { Router, Request, Response } from 'express';
import { DataQualityLogService } from '../services/DataQualityLog.service';

const dqService = new DataQualityLogService();
export const DataQualityLogRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DataQualityLog:
 *       type: object
 *       properties:
 *         logId:
 *           type: integer
 *           description: Auto-generated log ID
 *         runId:
 *           type: string
 *           format: uuid
 *           description: Identifier of the pipeline run
 *         tableName:
 *           type: string
 *         recordId:
 *           type: string
 *           nullable: true
 *         issueType:
 *           type: string
 *         details:
 *           type: object
 *           additionalProperties: true
 *         loggedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the issue was logged
 *
 * tags:
 *   - name: DataQualityLog
 *     description: Data quality issue logs
 */

/**
 * @swagger
 * /analytics/dq-logs:
 *   get:
 *     summary: Retrieve all data quality logs
 *     tags: [DataQualityLog]
 *     responses:
 *       200:
 *         description: List of data quality logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataQualityLog'
 */
DataQualityLogRouter.get('/', async (_req: Request, res: Response) => {
  const logs = await dqService.findAll();
  res.json(logs);
});

/**
 * @swagger
 * /analytics/dq-logs/run/{runId}:
 *   get:
 *     summary: Retrieve logs for a specific pipeline run
 *     tags: [DataQualityLog]
 *     parameters:
 *       - in: path
 *         name: runId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the pipeline run
 *     responses:
 *       200:
 *         description: List of data quality logs for the run
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataQualityLog'
 */
DataQualityLogRouter.get('/run/:runId', async (req: Request, res: Response) => {
  const runId = req.params.runId;
  const logs = await dqService.findByRun(runId);
  res.json(logs);
});

/**
 * @swagger
 * /analytics/dq-logs:
 *   post:
 *     summary: Create a new data quality log entry
 *     tags: [DataQualityLog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - runId
 *               - tableName
 *               - issueType
 *             properties:
 *               runId:
 *                 type: string
 *                 format: uuid
 *               tableName:
 *                 type: string
 *               recordId:
 *                 type: string
 *               issueType:
 *                 type: string
 *               details:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Data quality log created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataQualityLog'
 */
DataQualityLogRouter.post('/', async (req: Request, res: Response) => {
  const entry = await dqService.log(req.body);
  res.status(201).json(entry);
});
