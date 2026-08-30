import './config/load-env';
import type { Server } from 'node:http';
import { createApp } from './app';
import { getEnv } from './config/env';
import { logger } from './lib/logger';
import { closePool, pool } from './db/pool';
import { ensureUploadRoot, uploadRoot } from './modules/upload/storage';

async function main(): Promise<void> {
  const env = getEnv();

  await pool.query('SELECT 1');
  await ensureUploadRoot();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, uploadRoot }, 'wishlist api listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'failed to start');
  process.exit(1);
});
