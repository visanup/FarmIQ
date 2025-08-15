// src/routes/ingestion.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { apiKey } from '../middleware/apiKey';
import { ingestImage, listRecentMedia } from '../services/media.service';
import { z } from 'zod';
import { IngestMetaSchema } from '../schemas/ingestion.schemas';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const uploadSingle: import('express').RequestHandler = (req, res, next) =>
  (upload.single('file') as any)(req, res, next);

const router = Router();

router.post(
  '/image',
  apiKey as any,
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'file is required' });

      const parsed = IngestMetaSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const out = await ingestImage(
        {
          buffer: req.file!.buffer,
          originalname: req.file!.originalname,
          mimetype: req.file!.mimetype,
          size: req.file!.size,
        },
        parsed.data
      );
      return res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/recent', apiKey as any, async (req, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 200);
    res.json(await listRecentMedia(limit));
  } catch (e) {
    next(e);
  }
});

export default router;

