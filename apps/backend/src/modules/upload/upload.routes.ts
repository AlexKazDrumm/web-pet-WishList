import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { HttpError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';
import { uploadRateLimit } from '../../middleware/security';
import { singleFile } from './upload.middleware';
import { storeUpload } from './upload.service';
import { openStored, statStored } from './storage';

export const uploadRouter = Router();

uploadRouter.post(
  '/uploads',
  requireAuth,
  uploadRateLimit,
  singleFile,
  asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('Expected a file field named "file"');
    const result = await storeUpload(req.file);
    res.status(201).json(result);
  }),
);

const CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

uploadRouter.get(
  '/files/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id ?? '';
    const stored = await statStored(id);
    if (!stored) throw HttpError.notFound('File not found');

    const ext = (id.split('.').pop() ?? '').toLowerCase();
    res.setHeader('Content-Type', CONTENT_TYPE[ext] ?? 'application/octet-stream');
    res.setHeader('Content-Length', String(stored.size));
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    openStored(stored.path).pipe(res);
  }),
);
