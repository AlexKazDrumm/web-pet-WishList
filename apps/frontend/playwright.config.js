const { defineConfig, devices } = require('@playwright/test');

const API_URL = process.env.E2E_API_URL || 'http://localhost:3031';
const WEB_URL = process.env.E2E_WEB_URL || 'http://localhost:3000';
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL || 'postgres://wishlist_test:wishlist_test@localhost:5432/wishlist_e2e';

const backendEnv = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '3031',
  DATABASE_URL: E2E_DATABASE_URL,
  CORS_ORIGINS: WEB_URL,
  JWT_ACCESS_SECRET: 'e2e-access-secret-000000000000000000000000000',
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-1111111111111111111111111',
  UPLOAD_DIR: './var/e2e-uploads',
  LOG_LEVEL: 'warn',
};

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'npm run migrate:prod --workspace @wishlist/backend && npm run seed --workspace @wishlist/backend && npm run serve --workspace @wishlist/backend',
      cwd: '../../',
      url: `${API_URL}/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: backendEnv,
    },
    {
      command: 'npm run dev --workspace @wishlist/frontend',
      cwd: '../../',
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, NEXT_PUBLIC_API_BASE_URL: API_URL },
    },
  ],
});
