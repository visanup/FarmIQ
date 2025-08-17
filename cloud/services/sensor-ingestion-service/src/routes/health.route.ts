// src/routes/health.route.ts
import { Router } from 'express';
const r = Router();
r.get('/', (_req, res) => res.json({ ok: true, service: 'edge-orchestrator-service' }));
export default r;
