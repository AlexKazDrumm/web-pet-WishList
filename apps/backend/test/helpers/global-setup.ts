import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { rm } from 'node:fs/promises';
import { Client } from 'pg';

const localRequire = createRequire(path.join(__dirname, 'global-setup.ts'));

/** Applies migrations to the test database once before the whole run. */
export default async function setup(): Promise<void> {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/wishlist_test';

  await rm(path.resolve(__dirname, '../../var/test-uploads'), { recursive: true, force: true });

  const probe = new Client({ connectionString: databaseUrl });
  try {
    await probe.connect();
    await probe.end();
  } catch (err) {
    throw new Error(
      `Cannot reach the test database at ${databaseUrl.replace(/:\/\/[^@]*@/, '://***@')}. ` +
        `Start PostgreSQL and create the database, or set TEST_DATABASE_URL. Cause: ${(err as Error).message}`,
    );
  }

  const backendRoot = path.resolve(__dirname, '../..');
  const pkgPath = localRequire.resolve('node-pg-migrate/package.json');
  const pkg = localRequire("node-pg-migrate/package.json") as { bin: string | Record<string, string> };
  const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin['node-pg-migrate'];
  const binJs = path.join(path.dirname(pkgPath), binRel);

  execFileSync(process.execPath, [binJs, 'up', '--migrations-dir', 'src/db/migrations'], {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'ignore',
  });
}
