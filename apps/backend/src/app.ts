import express, { type Express } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import { asyncHandler } from './lib/async-handler';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import {
  corsMiddleware,
  globalRateLimit,
  helmetMiddleware,
  jsonBody,
  urlencodedBody,
} from './middleware/security';
import { authRouter } from './modules/auth/auth.routes';
import { listsRouter } from './modules/lists/lists.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { uploadRouter } from './modules/upload/upload.routes';
import { pool } from './db/pool';
import { getEnv } from './config/env';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', getEnv().TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  app.use(helmetMiddleware());
  app.use(corsMiddleware());
  app.use(globalRateLimit);
  app.use(jsonBody);
  app.use(urlencodedBody);

  app.get(
    '/health',
    asyncHandler(async (_req, res) => {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', uptime: process.uptime() });
    }),
  );

  app.use('/auth', authRouter);
  app.use('/lists', listsRouter);
  app.use('/catalog', catalogRouter);
  app.use(uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
