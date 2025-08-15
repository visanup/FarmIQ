// services/analytics/src/routes/PipelineMetadata.route.ts
import { Router, Request, Response } from 'express';
import { PipelineMetadataService } from '../services/PipelineMetadata.service';

const metaService = new PipelineMetadataService();
export const PipelineMetadataRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PipelineMetadata:
 *       type: object
 *       properties:
 *         runId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the pipeline run
 *         pipelineName:
 *           type: string
 *           description: Name of the pipeline
 *         version:
 *           type: string
 *           description: Version identifier of the pipeline
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the run started
 *         finishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when the run finished
 *         status:
 *           type: string
 *           description: Current status of the run (e.g., running, success, failed)
 *         metrics:
 *           type: object
 *           additionalProperties: true
 *           description: Arbitrary metrics collected during the run
 */
/**
 * @swagger
 * tags:
 *   name: PipelineMetadata
 *   description: Pipeline run metadata management
 */

/**
 * @swagger
 * /analytics/pipelines/start:
 *   post:
 *     summary: Create a new pipeline run record (start)
 *     tags: [PipelineMetadata]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PipelineMetadata'
 *     responses:
 *       201:
 *         description: Pipeline run started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineMetadata'
 */
PipelineMetadataRouter.post('/start', async (req: Request, res: Response) => {
  const run = await metaService.start(req.body);
  res.status(201).json(run);
});

/**
 * @swagger
 * /analytics/pipelines/finish/{runId}:
 *   put:
 *     summary: Mark a pipeline run as finished
 *     tags: [PipelineMetadata]
 *     parameters:
 *       - in: path
 *         name: runId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the pipeline run to finish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               finishedAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               metrics:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Pipeline run updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineMetadata'
 *       404:
 *         description: Pipeline run not found
 */
PipelineMetadataRouter.put('/finish/:runId', async (req: Request, res: Response) => {
  const runId = req.params.runId;
  const updated = await metaService.finish(runId, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

/**
 * @swagger
 * /analytics/pipelines/{runId}:
 *   get:
 *     summary: Get pipeline run metadata by ID
 *     tags: [PipelineMetadata]
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
 *         description: Pipeline metadata found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineMetadata'
 *       404:
 *         description: Pipeline run not found
 */
PipelineMetadataRouter.get('/:runId', async (req: Request, res: Response) => {
  const runId = req.params.runId;
  const meta = await metaService.getById(runId);
  if (!meta) return res.status(404).json({ message: 'Not found' });
  res.json(meta);
});
