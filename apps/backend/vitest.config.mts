import { defineConfig } from 'vitest/config';

const TEST_DB =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/wishlist_test';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globalSetup: ['./test/helpers/global-setup.ts'],
    setupFiles: ['./test/helpers/setup.ts'],
    hookTimeout: 60_000,
    testTimeout: 20_000,
    fileParallelism: false,
    reporters: 'default',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DB,
      JWT_ACCESS_SECRET: 'test-access-secret-000000000000000000000000',
      JWT_REFRESH_SECRET: 'test-refresh-secret-11111111111111111111111',
      ACCESS_TOKEN_TTL: '15m',
      REFRESH_TOKEN_TTL: '30d',
      CORS_ORIGINS: 'http://localhost:3000',
      LOG_LEVEL: 'silent',
      UPLOAD_DIR: './var/test-uploads',
      MAX_UPLOAD_BYTES: '4096',
    },
  },
});
