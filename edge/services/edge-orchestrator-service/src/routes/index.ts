// src/routes/index.ts

import { Router } from 'express';
import health from './health.route';
import datasets from './datasets.route';
import models from './models.route';
import infer from './infer.route';

const r = Router();
r.use('/health', health);
r.use('/datasets', datasets);
r.use('/models', models);
r.use('/infer', infer);
export default r;

