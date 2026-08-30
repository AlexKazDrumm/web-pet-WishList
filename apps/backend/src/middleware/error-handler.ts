import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ERROR_CODES } from '@wishlist/shared';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { HttpError } from '../lib/http-error';
import { logger } from '../lib/logger';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: ERROR_CODES.NOT_FOUND, message: 'Route not found' } });
};

/** Final middleware: normalises every failure into `{ error: { code, message } }`. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ERROR_CODES.VALIDATION,
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err instanceof MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT';
    res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? ERROR_CODES.PAYLOAD_TOO_LARGE : ERROR_CODES.VALIDATION,
        message: `Upload rejected: ${err.code}`,
      },
    });
    return;
  }

  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({ error: { code: ERROR_CODES.PAYLOAD_TOO_LARGE, message: 'Request body too large' } });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'unhandled error');
  res.status(500).json({ error: { code: ERROR_CODES.INTERNAL, message: 'Internal server error' } });
};
